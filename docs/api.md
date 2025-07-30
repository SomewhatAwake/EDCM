# API Documentation

## Authentication

All API endpoints (except `/auth/login` and `/auth/register`) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "commander_name",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "commander_name"
  }
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "username": "commander_name",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "commander_name"
  }
}
```

#### GET /api/auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "commander_name"
  }
}
```

### Fleet Carriers

#### GET /api/carrier
Get all carriers for the authenticated user.

**Response:**
```json
[
  {
    "id": "K7J-H9T",
    "name": "CARRIER NAME",
    "current_system": "Sol",
    "docking_access": "all",
    "notorious_access": false,
    "fuel_level": 800,
    "jump_cooldown": 0,
    "balance": 5000000000,
    "last_updated": "2023-07-30T12:00:00Z"
  }
]
```

#### GET /api/carrier/:carrierId
Get detailed information about a specific carrier.

**Response:**
```json
{
  "id": "K7J-H9T",
  "name": "CARRIER NAME",
  "current_system": "Sol",
  "docking_access": "all",
  "notorious_access": false,
  "fuel_level": 800,
  "jump_cooldown": 0,
  "balance": 5000000000,
  "services": [
    {
      "service_type": "refuel",
      "enabled": true
    },
    {
      "service_type": "repair",
      "enabled": true
    }
  ],
  "last_updated": "2023-07-30T12:00:00Z"
}
```

#### PUT /api/carrier/:carrierId/docking
Update carrier docking permissions.

**Request Body:**
```json
{
  "dockingAccess": "all|friends|squadron|squadronfriends",
  "notoriousAccess": true
}
```

**Response:**
```json
{
  "message": "Docking permissions updated successfully",
  "dockingAccess": "all",
  "notoriousAccess": true
}
```

#### POST /api/carrier/:carrierId/jump
Initiate a carrier jump to a target system.

**Request Body:**
```json
{
  "targetSystem": "Alpha Centauri"
}
```

**Response:**
```json
{
  "message": "Jump initiated successfully",
  "targetSystem": "Alpha Centauri",
  "currentSystem": "Sol"
}
```

#### PUT /api/carrier/:carrierId/services
Update carrier services.

**Request Body:**
```json
{
  "services": [
    {
      "type": "refuel",
      "enabled": true
    },
    {
      "type": "repair",
      "enabled": false
    }
  ]
}
```

**Response:**
```json
{
  "message": "Services updated successfully"
}
```

#### GET /api/carrier/:carrierId/market
Get carrier market data.

**Response:**
```json
{
  "carrierId": "K7J-H9T",
  "commodities": [
    {
      "name": "Tritium",
      "demand": 500,
      "supply": 0,
      "buyPrice": 50000,
      "sellPrice": 0
    }
  ],
  "lastUpdated": "2023-07-30T12:00:00Z"
}
```

#### PUT /api/carrier/:carrierId/name
Update carrier name.

**Request Body:**
```json
{
  "name": "NEW CARRIER NAME"
}
```

**Response:**
```json
{
  "message": "Carrier name updated successfully",
  "name": "NEW CARRIER NAME"
}
```

## WebSocket Events

### Client to Server

- `subscribe_carrier_updates` - Subscribe to updates for a specific carrier
- `unsubscribe_carrier_updates` - Unsubscribe from carrier updates

### Server to Client

- `carrier_stats` - Carrier statistics updated
- `carrier_jump` - Carrier completed a jump
- `carrier_finance` - Carrier financial data updated
- `carrier_docking_permission` - Docking permissions changed
- `carrier_name_changed` - Carrier name changed

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

Error responses include a message:

```json
{
  "error": "Error description",
  "details": "Additional error details (optional)"
}
```
