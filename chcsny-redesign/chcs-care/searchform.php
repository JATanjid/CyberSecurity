<form role="search" method="get" class="search-form field" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="display:flex;gap:10px;max-width:520px;margin-top:24px">
	<label class="screen-reader-text" for="s"><?php esc_html_e( 'Search', 'chcs-care' ); ?></label>
	<input type="search" id="s" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'Search the site…', 'chcs-care' ); ?>">
	<button class="btn btn--teal" type="submit"><?php esc_html_e( 'Search', 'chcs-care' ); ?></button>
</form>
