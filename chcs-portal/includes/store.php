<?php
/**
 * Generic record store: one indexed table holds every portal record type
 * (time entries, cases, notes, messages, shifts, training results, …).
 * Indexed columns: type, owner_id, ref_id, status, date_key. Everything else lives in JSON `data`.
 *
 * @package chcs-portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function chcs_table() {
	global $wpdb;
	return $wpdb->prefix . 'chcs_records';
}

function chcs_store_install() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$table   = chcs_table();
	$charset = $wpdb->get_charset_collate();
	dbDelta(
		"CREATE TABLE {$table} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		type varchar(40) NOT NULL,
		owner_id bigint(20) unsigned NOT NULL DEFAULT 0,
		ref_id bigint(20) unsigned NOT NULL DEFAULT 0,
		status varchar(30) NOT NULL DEFAULT '',
		date_key varchar(10) NOT NULL DEFAULT '',
		data longtext NOT NULL,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		KEY type_owner (type,owner_id),
		KEY type_ref (type,ref_id),
		KEY type_status (type,status),
		KEY type_date (type,date_key)
		) {$charset};"
	);
	update_option( 'chcs_portal_db', CHCS_PORTAL_VERSION );
}

/** Which record fields are copied into the indexed columns, per type. */
function chcs_rec_index_map() {
	return array(
		'time'                => array( 'owner' => 'userId', 'ref' => 'caseId', 'status' => 'status', 'date' => 'date' ),
		'cases'               => array( 'owner' => 'createdBy', 'status' => 'status' ),
		'caseNotes'           => array( 'owner' => 'userId', 'ref' => 'caseId' ),
		'notes'               => array( 'owner' => 'userId', 'ref' => 'caseId', 'status' => 'status', 'date' => 'date' ),
		'conversations'       => array(),
		'messages'            => array( 'owner' => 'userId', 'ref' => 'convId' ),
		'shifts'              => array( 'owner' => 'userId', 'date' => 'date' ),
		'inservices'          => array(),
		'inserviceResults'    => array( 'owner' => 'userId', 'ref' => 'inserviceId' ),
		'orientationModules'  => array(),
		'orientationProgress' => array( 'owner' => 'userId', 'ref' => 'moduleId' ),
		'applications'        => array( 'owner' => 'userId', 'status' => 'status' ),
		'emails'              => array(),
		'audit'               => array( 'owner' => 'userId' ),
		'notifications'       => array( 'owner' => 'userId', 'status' => 'status' ),
		'leave'               => array( 'owner' => 'userId', 'status' => 'status', 'date' => 'from' ),
		'calls'               => array( 'owner' => 'assignedTo', 'ref' => 'takenBy', 'status' => 'status', 'date' => 'day' ),
		'inserviceAssignments' => array( 'owner' => 'userId', 'ref' => 'inserviceId', 'status' => 'status' ),
		'tasks'               => array( 'owner' => 'assignedTo', 'ref' => 'createdBy', 'status' => 'status', 'date' => 'dueDate' ),
	);
}

function chcs_rec_columns( $type, $data ) {
	$map = chcs_rec_index_map();
	$m   = isset( $map[ $type ] ) ? $map[ $type ] : array();
	$get = function ( $k ) use ( $m, $data ) {
		return isset( $m[ $k ], $data[ $m[ $k ] ] ) ? $data[ $m[ $k ] ] : null;
	};
	return array(
		'owner_id' => (int) $get( 'owner' ),
		'ref_id'   => (int) $get( 'ref' ),
		'status'   => (string) $get( 'status' ),
		'date_key' => (string) $get( 'date' ),
	);
}

function chcs_rec_row( $row ) {
	if ( ! $row ) {
		return null;
	}
	$data = json_decode( $row->data, true );
	if ( ! is_array( $data ) ) {
		$data = array();
	}
	$data['id']        = (int) $row->id;
	$data['createdAt'] = mysql2date( 'c', $row->created_at, false );
	if ( isset( $row->updated_at ) && $row->updated_at !== $row->created_at ) {
		$data['updatedAt'] = mysql2date( 'c', $row->updated_at, false );
	}
	return $data;
}

function chcs_rec_insert( $type, array $data ) {
	global $wpdb;
	unset( $data['id'], $data['createdAt'], $data['updatedAt'] );
	$now = current_time( 'mysql', true );
	$wpdb->insert(
		chcs_table(),
		array_merge(
			array(
				'type'       => $type,
				'data'       => wp_json_encode( $data ),
				'created_at' => $now,
				'updated_at' => $now,
			),
			chcs_rec_columns( $type, $data )
		)
	);
	return chcs_rec_get( $type, $wpdb->insert_id );
}

function chcs_rec_get( $type, $id ) {
	global $wpdb;
	$t = chcs_table();
	return chcs_rec_row( $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$t} WHERE id = %d AND type = %s", $id, $type ) ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
}

function chcs_rec_update( $type, $id, array $changes ) {
	global $wpdb;
	$cur = chcs_rec_get( $type, $id );
	if ( ! $cur ) {
		return null;
	}
	$data = array_merge( $cur, $changes );
	unset( $data['id'], $data['createdAt'], $data['updatedAt'] );
	$wpdb->update(
		chcs_table(),
		array_merge(
			array(
				'data'       => wp_json_encode( $data ),
				'updated_at' => current_time( 'mysql', true ),
			),
			chcs_rec_columns( $type, $data )
		),
		array(
			'id'   => (int) $id,
			'type' => $type,
		)
	);
	return chcs_rec_get( $type, $id );
}

function chcs_rec_delete( $type, $id ) {
	global $wpdb;
	return (bool) $wpdb->delete(
		chcs_table(),
		array(
			'id'   => (int) $id,
			'type' => $type,
		)
	);
}

/**
 * Query records.
 *
 * @param string $type  Record type.
 * @param array  $where owner, ref, status (string|array), from, to (date_key), after_id.
 * @param int    $limit Max rows (0 = no limit).
 * @param string $order ASC|DESC by id.
 * @return array
 */
function chcs_rec_query( $type, array $where = array(), $limit = 0, $order = 'DESC' ) {
	global $wpdb;
	$t    = chcs_table();
	$sql  = "SELECT * FROM {$t} WHERE type = %s";
	$args = array( $type );
	if ( isset( $where['owner'] ) ) {
		$sql   .= ' AND owner_id = %d';
		$args[] = (int) $where['owner'];
	}
	if ( isset( $where['ref'] ) ) {
		$sql   .= ' AND ref_id = %d';
		$args[] = (int) $where['ref'];
	}
	if ( isset( $where['status'] ) ) {
		$st     = (array) $where['status'];
		$sql   .= ' AND status IN (' . implode( ',', array_fill( 0, count( $st ), '%s' ) ) . ')';
		$args   = array_merge( $args, $st );
	}
	if ( ! empty( $where['from'] ) ) {
		$sql   .= ' AND date_key >= %s';
		$args[] = $where['from'];
	}
	if ( ! empty( $where['to'] ) ) {
		$sql   .= ' AND date_key <= %s';
		$args[] = $where['to'];
	}
	if ( ! empty( $where['after_id'] ) ) {
		$sql   .= ' AND id > %d';
		$args[] = (int) $where['after_id'];
	}
	$sql .= ' ORDER BY id ' . ( 'ASC' === $order ? 'ASC' : 'DESC' );
	if ( $limit ) {
		$sql   .= ' LIMIT %d';
		$args[] = (int) $limit;
	}
	$rows = $wpdb->get_results( $wpdb->prepare( $sql, $args ) ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	return array_values( array_filter( array_map( 'chcs_rec_row', (array) $rows ) ) );
}
