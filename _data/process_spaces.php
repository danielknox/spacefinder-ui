<?php
$spacesjson = file_get_contents( "spaces.json" );
$spaces = json_decode( $spacesjson );
for( $i = 0; $i < count( $spaces ); $i++ ) {
	$spaces[$i]->work = array();
	foreach( array( "in_a_library", "private", "close", "friends", "group" ) as $work ) {
		$prop = 'work_' . $work;
		if ( $spaces[$i]->$prop ) {
			array_push( $spaces[$i]->work, $work );
		}
		unset( $spaces[$i]->$prop );
	}
	$newtags = array();
	if ( count( $spaces[$i]->tags ) ) {
		foreach ( $spaces[$i]->tags as $tag ) {
			array_push( $newtags, $tag->name );
		}
	}
	$spaces[$i]->tags = $newtags;
}
file_put_contents( "spaces_new.json", json_encode( $spaces, JSON_UNESCAPED_SLASHES ) );