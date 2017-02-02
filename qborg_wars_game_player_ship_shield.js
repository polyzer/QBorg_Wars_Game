var _ShipShield = function ()
{
	this.Health = 100;
	this.MaxHealth = 100;
	this.Status = SHIP_SHIELD.STATUS.WORKING;
	this.
};
_ShipShield.prototype.onDamage = function (json_params)
{
	this.Health -= json_params.damage;
};
_ShipShield.prototype.fix = function ()
{
	this.Health = this.MaxHealth;
};
_ShipShield.prototype.getStatus = function ()
{
	return this.Status;
};
_ShipShield.prototype.updateStatus = function (json_params)
{
	if(this.Health <= 0)
	{
		this.Health = 0;
		this.Status = SHIP_SHIELD.STATUS.BROKEN;
	}
};