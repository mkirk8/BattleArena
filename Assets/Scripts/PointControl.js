#pragma strict
/**
	Moves the point indicators from their given location to the
	player's window
*/
var dest : Vector3;

function Update () {
	var move : Vector3;
	move = new Vector3(dest.x - transform.position.x,dest.y - transform.position.y,dest.z - transform.position.z);
	if(move.magnitude < 0.5){
		Destroy(gameObject);
	}
	else{
		transform.Translate(move * Time.deltaTime / (move.magnitude / 15));
	}
}

function SetMovement(region : int, player : int){
	var regionPosition : Vector3;
	var regionScale : Vector3; 

	regionPosition = GameObject.Find("Region " + region).transform.position;
	regionScale = GameObject.Find("Region " + region).transform.lossyScale;
	
	regionPosition.x -= (regionScale.x * 3.5);
	regionPosition.y += (regionScale.z * 3.5);
	regionPosition.z = -3;
	
	transform.position = regionPosition;
	
	if(player == 1){
		dest = new Vector3(-20,10,-3);
	}
	else{
		dest = new Vector3(20,10,-3);
	}
}