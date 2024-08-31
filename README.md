# Job Search Extension

Welcome to the **Job Search Extension** project!

## Overview

The **Job Search Extension** is designed to enhance your job search experience by integrating with Google services and leveraging OpenAI's capabilities. This README will guide you through the setup, configuration, and deployment of the extension and associated server.

## Built With

- **Google Chrome**
- **Google Cloud Compute Engine**

## Technologies Used

- **Node.js** (18.8.0)
- **Express**
- **PostgreSQL**
- **Knex**
- **Google APIs** (`googleapis`)
- **OpenAI API** (`openai`)
- **Docker**
- **Google Cloud Platform**
- **Ubuntu 20.04 LTS**

## Requirements for Further Development

1. **Google Cloud Project**  
   Create a Google Cloud project [here](https://developers.google.com/workspace/guides/create-project).

2. **OAuth2 Credentials**  
   Set up OAuth2 credentials associated with your Google Cloud project.

3. **OpenAI Project**  
   Learn about OpenAI projects and using its API [here](https://platform.openai.com/docs/quickstart).

## Setup Guides

### Google Cloud Project Setup

To get the extension working, you need to set up an OAuth consent screen within your Google Cloud Project.

1. Log into your Google Cloud Project.
2. Navigate to 'API and Services'.
3. Click '+ ENABLE APIS AND SERVICES'.
4. Search for and subscribe to 'Gmail API' and 'People API'.
5. Select 'OAuth consent screen' from the navigation pane.
6. Click 'EDIT APP'.
7. Confirm the information for page 1 and SAVE.
8. Click 'ADD OR REMOVE SCOPES':
   - Add Gmail API scopes: 'modify', 'compose', and 'readonly'.
   - Add People API scope: 'profile'.
   - SAVE.
9. Add test users as needed and SAVE.
10. Review and confirm.

### Google Chrome Extension Setup

1. Download and install Google Chrome: [Google Chrome](https://www.google.com/chrome/).
2. Download and move the Extension folder to your desired testing location.
3. Open Google Chrome and navigate to the Extensions Manager page (chrome://extensions).
4. Enable 'Developer Mode'.
5. Click 'Load unpacked'.
6. Open the Extension folder.
7. Copy the Extension 'ID' listed in the Extension block.
8. Navigate to Google Cloud 'API and Services'.
9. Select 'Credentials'.
10. Click '+ CREATE CREDENTIALS' > OAuth client ID.
11. Select 'Chrome Extension'.
12. Assign a name and paste the Extension 'ID' copied above into 'Item ID'. (OWNERSHIP does not need to be verified)
13. Click 'CREATE'.
14. Copy the generated Client ID.
15. Paste the Client ID into `manifest.json["oauth"]["client_id"]`.

Your Extension can now request a token from your Google Cloud Project. Only allowed users will be available to opt in.

### Server-Side Setup

#### Before Deployment

##### API Key Instructions

1. Generate an API key from OpenAI:
   - Visit [OpenAI API Keys](https://platform.openai.com/settings/organization/general).
   - Click on "Your profile" > "User API Keys".
   - Click on "+ Create new secret key".
     - Set to whatever name you like, All permissions.
     - Click "Create secret key".
     - Copy the key.
   - Create a file on the server under `/bin/config/openai_API_key.json` with the following contents:
     ```json
     {
         "secret_key": "<YOUR-KEY-HERE>"
     }
     ```

##### Upload Files to Google Cloud VM

1. Ensure `unzip` is installed on the Google Cloud VM:
   - SSH into the VM.
   - Run: `sudo apt install unzip`.
2. Zip all contents of `/Server` into a file (e.g., `Deploy.zip`).
3. SSH into Google Cloud VM.
4. Upload the zip file.
   - Select your zip file.
5. Run the following commands:
   ```bash
   mkdir Deploy
   cd Deploy
   unzip ../Deploy.zip
   ```

#### Run Deployment

##### Deploy Docker on Virtual Machine

1. Follow the Docker installation guide for Ubuntu: [Docker Engine Installation](https://docs.docker.com/engine/install/ubuntu/).
   - Start by uninstalling any old versions.
   - Then, follow the instructions to install using the apt repository.

2. Build the Docker image:
   ```bash
   sudo docker build -t job-search-server:latest .
   ```

3. Run the Docker container:
   ```bash
   sudo docker run -d \
       --name job-search-server-container \
       -p 3000:3000 \
       job-search-server:latest
   ```

4. Test the connection:
   - Local: `sudo curl http://localhost:3000`
   - Remote: `curl https://your-domain:443`

**Note:** Persistent data has not been linked to a mounted drive yet. Further commands will be provided for that.

### Transition from HTTP to HTTPS with Nginx

#### Install Necessary Packages

1. Update the package list and upgrade installed packages:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

2. Install Nginx:
   ```bash
   sudo apt-get install nginx
   ```

3. Install Certbot for SSL certificate management:
   ```bash
   sudo snap install --classic certbot
   ```

4. Install UFW for firewall management:
   ```bash
   sudo apt install ufw
   ```

#### Configure Nginx

1. Unlink the default Nginx configuration:
   ```bash
   sudo unlink /etc/nginx/sites-enabled/default
   ```

2. Create a basic HTTP configuration for Nginx:
   ```bash
   cd /etc/nginx/sites-available
   sudo nano job-search-server-container.config
   ```
   - Insert the following configuration:
     ```nginx
     server {
         listen 80;
         server_name www.your-domain.com your-domain.com;

         location / {
             return 301 https://$host$request_uri;
         }
     }
     ```
   - Save and exit the editor (In nano, press CTRL+X, then Y, and Enter).

3. Enable the new Nginx site configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/job-search-server-container.config /etc/nginx/sites-enabled/
   sudo nginx -t
   ```
   - Resolve any issues if errors are reported.

4. Obtain SSL certificates using Certbot:
   ```bash
   sudo certbot --nginx
   ```
   - Certbot will handle SSL certificate issuance and update the Nginx configuration.

5. Updated Nginx configuration with SSL:
   - Certbot should automatically update the configuration. For reference:
     ```nginx
     server {
         listen 80;
         server_name www.your-domain.com your-domain.com;

         location / {
             return 301 https://$host$request_uri;
         }
     }

     server {
         listen 443 ssl;
         server_name www.your-domain.com your-domain.com;

         ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
         ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

         ssl_protocols TLSv1.2 TLSv1.3;
         ssl_prefer_server_ciphers on;
         ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
         ssl_session_cache shared:SSL:10m;
         ssl_session_timeout 10m;

         location / {
             proxy_pass http://127.0.0.1:3000;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
         }
     }
     ```

6. Verify and apply the Nginx configuration:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. Test automatic renewal of SSL certificates:
   ```bash
   sudo certbot renew --dry-run
   ```

8. Configure the firewall:
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   sudo ufw enable
   sudo ufw status
   ```

## Google Cloud Project Utilization

In our Google Cloud project, we utilized the following services:

- **APIs and Services** (OAuth)
- **Compute Engine** (Virtual Machine)
- **VPC Network** (Firewall)
