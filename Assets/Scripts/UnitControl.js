#pragma strict
/**
	Manages a unit's stats, animations, and movement
*/

var hasMoved: boolean;
var spd : int;
var rng : int;
var atk : int;
var hlth : int;
var cost : int;
var IsDest : boolean;
var anim : Animator;
var IsShip : boolean;
var dest : Vector3;
var Bullet : GameObject;

function Awake(){
	hasMoved = false;
}

function Start () {
	UpdateGlow(0.5f);
	IsDest = true;
	if(!IsShip)
	{
		//Ships do not use animators, instead they simply translate / rotate
		anim = GetComponent(Animator);
	}
}

function FixedUpdate () {
	if(!IsDest){
		//Moving the unit to new destination
		var move : Vector3;
		var curr : Vector3;
		curr = transform.position;
		move = new Vector3(dest.x - curr.x, dest.y - curr.y, dest.z - curr.z);
		
		if(IsShip){
			/**
				Due to the way unity handles sprites (specifically rotation)
				some work-arounds were needed
			*/
			if(transform.rotation == Quaternion.Euler(0,0,90) ||transform.rotation == Quaternion.Euler(0,0,270))
			{
				move.x *= -1;
			}
			move = transform.rotation * move;
		}
		if(move.magnitude < 0.1){
			//location met
			IsDest = true;
			if(!IsShip)
			{
				//end animation of all non-ship units
				anim.SetBool("IsDest",IsDest);
			}
			GameObject.FindGameObjectWithTag("GameController").GetComponent(GameControl).MovementCompleted();
			hasMoved = true;
			UpdateGlow(0.15f);
		}
		else{
			//move the unit, location still not met
			transform.Translate(move / move.magnitude * Time.deltaTime * 2.5);
		}
	}
	
	//Update the glow to show the player who has and hasn't moved
	if(hasMoved){
		UpdateGlow(0.15f);
	}
	else{
		UpdateGlow(0.75f);
	}
}

//Create a bullet and fire it at the given target
function Fire(target : GameObject){
	var obj = Instantiate(Bullet,transform.position,new Quaternion(0,0,0,0));
	obj.GetComponent(BulletControl).Shoot(target,atk);
}

//take damage, if this damage kills the unit, update it's player and destroy
function DealDamage(d : int){
	hlth -= d;
	if(hlth <= 0){
		if(gameObject.name.LastIndexOf("1") > -1){
			GameObject.Find("Player 1").GetComponent(PlayerControl).Remove(gameObject); 
		}
		else{
			GameObject.Find("Player 2").GetComponent(PlayerControl).Remove(gameObject); 
		}
		Destroy(transform.gameObject);
	}
}

//get the current unit glow
function CurrentGlow(){
	return transform.FindChild("Glow").GetComponent(SpriteRenderer).color.a;
}

//update the unit's glow
function UpdateGlow(alpha : float){
	var GlowRend : SpriteRenderer;
	GlowRend = transform.FindChild("Glow").GetComponent(SpriteRenderer);
	var GlowC : Color;
	GlowC = GlowRend.color;
	GlowC.a = alpha;
	GlowRend.color = GlowC;
}

//prepare the unit for moving to a new destination
function MoveTo(panel : GameObject){
	dest = panel.transform.position;
	dest.z = -2.8;
	
	IsDest = false;
	var panelScale  = panel.transform.lossyScale;
	var vertDif : float;
	
	if(!IsShip)
	{
		//non-ship units simply calculate new location...
		dest.x -= (panelScale.x * 3.5);
		dest.y += (panelScale.z * 3.5);
		vertDif = dest.y - transform.position.y;
		
		//and update the animator
		if(vertDif < 1 && vertDif > -1){
			anim.SetBool("VertMove",false);
			anim.SetBool("Left",dest.x < transform.position.x);
		}
		else{
			anim.SetBool("VertMove",true);
			anim.SetBool("Up",dest.y > transform.position.y);
		}
		anim.SetBool("IsDest",IsDest);
	}
	else
	{
		//ships have to calculate their location differently
		dest.x += (panelScale.x * 4.5);
		dest.y -= (panelScale.z * 4.5);
		vertDif = dest.y - transform.position.y;
		
		//and instead of updating an animator, the must handle
		//their own rotation.
		if(vertDif < 1 && vertDif > -1){
			if(dest.x > transform.position.x){
				transform.rotation = Quaternion.Euler(0,0,270);
			}
			else
			{
				transform.rotation = Quaternion.Euler(0,0,90);
			}
			dest.y = transform.position.y;
		}
		else{
			if(dest.y > transform.position.y){
				transform.rotation = Quaternion.Euler(0,0,0);
			}
			else{
				transform.rotation = Quaternion.Euler(0,0,180);
			}
		}
		
	}
}