request = function()
	body = '{"example": "data", "id": ' .. math.random(1, 1000000) .. "}"
	return wrk.format("POST", "/answers", { ["Content-Type"] = "application/json" }, body)
end
