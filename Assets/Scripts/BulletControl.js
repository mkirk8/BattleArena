#pragma strict
/**
	Used to track a bullet from a unit, and damages the target on hit
*/
var ShotFired : boolean;
var dest : Vector3;
var unit : GameObject;
var atk : int;

function Update () {
	//move the bullet to the target at a constant rate
	var move = new Vector3(dest.x - transform.position.x, dest.y - transform.position.y, dest.z - transform.position.z);
	if(move.magnitude < 0.1){
		//location has been met, damage target, and destroy bullet
		unit.GetComponent(UnitControl).DealDamage(atk);
		GameObject.FindGameObjectWithTag("GameController").GetComponent(GameControl).AttackCompleted();
		Destroy(gameObject);
	}
	else{
		transform.Translate(move / move.magnitude * Time.deltaTime * 5);
	}
}

/**
	Takes the target unit, and the amount of damage to deal
*/
function Shoot(u : GameObject, a : int){
	dest = u.transform.position;
	ShotFired = true;
	unit = u;
	atk = a;
}