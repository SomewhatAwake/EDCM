# Tailscale Setup for Elite Dangerous Carrier Manager

This guide will help you set up Tailscale to securely access your Carrier Manager server from anywhere.

## What is Tailscale?

Tailscale creates a secure mesh VPN network that allows your devices to communicate with each other as if they were on the same local network, no matter where they are in the world. This is perfect for accessing your home server from your mobile device while traveling.

## Setup Process

### 1. Install Tailscale

#### On Windows (Server Machine):
1. Download Tailscale from https://tailscale.com/download/windows
2. Install and run the application
3. Sign up for a free Tailscale account (supports up to 20 devices)
4. Follow the setup wizard to connect your machine

#### On Android (Mobile Device):
1. Install Tailscale from Google Play Store
2. Log in with the same account you used on Windows
3. Enable the VPN connection

### 2. Configure Your Server

#### Find Your Tailscale IP:
1. On Windows, open Command Prompt and run: `tailscale ip -4`
2. Note the IP address (it will look like `100.x.x.x`)

#### Update Server Configuration:
1. Edit the `.env` file in your server directory
2. Update these values:
   ```
   TAILSCALE_ENABLED=true
   TAILSCALE_HOSTNAME=100.x.x.x  # Use your actual Tailscale IP
   TAILSCALE_PORT=3000
   ```

#### Optional: Use Tailscale Hostname (MagicDNS):
Tailscale can provide a hostname instead of an IP address:
1. Enable MagicDNS in your Tailscale admin console
2. Your machine will be accessible at something like `your-machine-name.tail-scale.ts.net`
3. Use this hostname instead of the IP address in the configuration

### 3. Configure Your Flutter App

#### Option A: Environment Variables (Recommended)
When building the app for Tailscale use, set these environment variables:
```bash
flutter build apk --dart-define=USE_TAILSCALE=true --dart-define=TAILSCALE_HOSTNAME=100.x.x.x --dart-define=TAILSCALE_PORT=3000
```

#### Option B: Direct Configuration
Modify `lib/config/network_config.dart`:
```dart
static const bool useTailscale = true;
static const String tailscaleHostname = '100.x.x.x'; // Your Tailscale IP
```

### 4. Test Your Setup

#### Server Test:
1. Restart your server after updating the `.env` file
2. From another device on Tailscale, test: `curl http://100.x.x.x:3000/health`

#### Flutter App Test:
1. Build and install the app with Tailscale configuration
2. Ensure both devices are connected to Tailscale
3. Test the connection in the app

## Security Benefits

- **End-to-end encryption**: All traffic is encrypted between your devices
- **No port forwarding**: No need to expose ports on your router
- **Access control**: You control which devices can connect
- **Audit logs**: See when and how your devices connect
- **No public exposure**: Your server isn't accessible from the internet

## Usage Scenarios

1. **At Home**: Use local network (fastest)
2. **Away from Home**: Automatically use Tailscale (secure)
3. **Development**: Use emulator endpoints for testing

## Troubleshooting

### Common Issues:

1. **Can't connect**: Ensure both devices are connected to Tailscale
2. **Slow performance**: Check Tailscale connection status
3. **Authentication errors**: Verify server is running and accessible

### Testing Commands:

```bash
# Check Tailscale status
tailscale status

# Test server connectivity
curl http://[tailscale-ip]:3000/health

# Check Tailscale logs
tailscale bugreport
```

## Advanced Configuration

### Custom Tailscale Port:
If you need to run the server on a different port:
1. Update `PORT` in `.env`
2. Update `TAILSCALE_PORT` in `.env`
3. Rebuild your Flutter app with the new port

### Multiple Environments:
You can configure different builds for different environments:
- Development: Local network
- Testing: Tailscale
- Production: Tailscale with custom domain

This setup ensures your carrier management is always accessible securely, whether you're at home or exploring the galaxy from a different location!
