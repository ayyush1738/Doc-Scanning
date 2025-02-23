const apiResponse = require("../utils/ApiResponse.js");
const asyncHandler =  require("../utils/asyncHandler.js");

const healthcheck = asyncHandler(async(requestAnimationFrame, res) => {
    return res.status(200)
    .json(new apiResponse(200, "OK", "Healthcheck Passed"));
})

module.exports = { healthcheck };
