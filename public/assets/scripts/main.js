/*global $*/

$( document ).ready(function() {
	const tabNames = [ "#Characters", "#System" ];

  $( '.Derived-Attributes-content .types-list-item' ).removeClass( 'col-md-2' ).addClass( 'col-md-4' );

  /* Redirects User to section in tab that may not be active */
  $( ".toc-sub-heading a" ).click( function( evt ) {
  	let tabName = evt.target.hash.split("-")[0];
  	tabNames.forEach(function( tab, index ) {
  		if( tab === tabName ) {
  			$( tabName + '-tab-link' ).addClass( 'active' ).attr( 'aria-expanded', true );
  			$( tabName ).addClass( 'active' );
  		} else {
  			$( tab + '-tab-link' ).removeClass( 'active' ).attr( 'aria-expanded', false );
  			$( tab ).removeClass( 'active' );
  		}
  	});
  });

	/* Sticky sidebar*/
  var sidebar = document.getElementById( 'table-of-contents' );
	Stickyfill.add( sidebar );

});
