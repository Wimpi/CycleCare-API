const { describe, it } = require('node:test');
const assert = require('node:assert').strict;
const sinon = require('sinon');
const { userLogin } = require('../controllers/userController');
const HttpStatusCodes = require('../utils/enums');

// Mock dependencies
const { generateJWT } = require('../middleware/createJWT');
const { login } = require('../database/dao/userDAO');

describe("[controllers / userController / login]", () => {
    it("should return a user and token for login", async () => {
        // Arrange
        const req = {
            body: {
                username: "Star3oy",
                password: "password123"
            }
        };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };

        const user = {
            email: "star3oy@example.com",
            role: "user",
            name: "Star",
            firstLastName: "Boy",
            secondLastName: "Example"
        };

        const token = "some-jwt-token";

        // Mock the login and generateJWT functions
        const loginStub = sinon.stub(login, 'call').resolves(user);
        const generateJWTStub = sinon.stub(generateJWT, 'call').resolves(token);

        // Act
        await userLogin(req, res);

        // Assert
        assert(res.status.calledWith(HttpStatusCodes.CREATED));
        assert(res.json.calledWith({
            token,
            ...user
        }));

        // Clean up
        loginStub.restore();
        generateJWTStub.restore();
    });
});