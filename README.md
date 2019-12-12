# Next on my calendar - Demo app

This is a demo JAMstack application (JavaScript, API, pre-rendered Markup), showcasing how apps that are completely client-side can have dynamic capabilities by relying on third-party APIs such as those powered by Office 365 and the Microsoft Graph. It also includes the ability to be deployed on the distributed web using the [Inter-Planetary File System](https://ipfs.io?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo) (IPFS).

> Learn more: [Your next app might not have a backend](https://withblue.ink/2019/11/16/your-next-app-may-not-have-a-backend.html?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo)

This demo apps shows what's the next event in your Office 365 calendar.

## See this app in action

This app is live on [next.italypaleale.me](https://next.italypaleale.me), served via IPFS!.<br />
You will need an Office 365 "Work or school" account to authenticate, which is usually connected to an Office 365 Business/Enterprise or Education. Personal Microsoft Accounts (e.g. Outlook.com/Hotmail) are not supported by this demo app.

![App screenshot](./screenshot.png)

## Building the app

In order to build the app, you'll need to set up a few things.

### 1. Clone the source code

Clone the repo and install the dependencies from NPM:

````sh
git clone https://github.com/ItalyPaleAle/calendar-next-demo
npm ci # or `npm install`
````

### 2. Get a Bing Maps API key

Get a free API key for using Bing Maps, which we'll use to show locations on a map.

> Full instructions in the [documentation](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo)

1. Navigate to [www.bingmapsportal.com](https://www.bingmapsportal.com/?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo) and sign in with a Microsoft Account (or use your GitHub account).
2. From the top navbar, choose "My Account" then "My Keys"
3. Click on "Click here to create a new key"
4. Fill in the form:
    - Application name: Any value you want
    - Application URL: Leave empty
    - Key type: Select "Basic"
    - Application type: Select "Dev/test"
5. After saving, you'll have a new **Bing Maps API key**: copy that, as we'll need it later

### 3. Create an OAuth app for Microsoft Graph

You'll also need a (free) OAuth application to connect to the Microsoft Graph and the Office 365 APIs.

> Full instructions in the [documentation](https://docs.microsoft.com/en-us/graph/auth-register-app-v2?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo)

1. Sign in to the Azure Portal at [portal.azure.com](https://portal.azure.com), for example using your GitHub account. You **do not need** an Azure subscription for this.
2. Search for "Azure Active Directory" (e.g. using the search bar at the top)
3. In the left blade, under "Manage", look for "App registrations"
4. Register a new application:
    - Name: "Next on your calendar", or any value you want
    - Supported account type: Enable only Work and school accounts (the app doesn't support personal Microsoft accounts at this point)
    - Redirect URI: Choose "Web", then set `https://ipfs/null` (the CI will automatically update this later on)
5. After creating the app, from the information blade copy the value for **Application (client) ID**, which we'll need later.
6. In the left blade, under "Manage" select "Authentication"
    1. Add a new Redirect UI of type "Web" pointing to `http://localhost:3000`
    2. In the "Implicit grant" section, check both boxes to enable the implicit grant for "Access tokens" and "ID tokens" (both). We need to do this because our app is a SPA without a backend server.
    3. Save the changes
7 . In the left blade, under "Manage" select "API permissions"
    1. Click on "Add a permission"
    2. Select "Microsoft Graph"
    3. Select "Delegated permissions"
    4. Ensure that the following permissions are selected:
        - `openid`
        - `profile`
        - `User.Read`
        - `Calendars.Read`
    5. Click on "Add permissions" to save

> If you're encountering issues, you can edit the Manifest file directly, ensuring that the following keys are set to these values (replacing previous values for those keys, if present):
> 
> ````json
> "requiredResourceAccess": [
>     {
>         "resourceAppId": "00000003-0000-0000-c000-000000000000",
>         "resourceAccess": [
>             {
>                 "id": "37f7f235-527c-4136-accd-4a02d197296e",
>                 "type": "Scope"
>             },
>             {
>                 "id": "14dad69e-099b-42c9-810b-d002981feec1",
>                 "type": "Scope"
>             },
>             {
>                 "id": "465a38f9-76ea-45b9-9f34-9e8b0d4b0b42",
>                 "type": "Scope"
>             },
>             {
>                 "id": "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
>                 "type": "Scope"
>             }
>         ]
>     }
> ],
> "replyUrlsWithType": [
>     {
>         "url": "https://ipfs/null",
>         "type": "InstalledClient"
>     },
>     {
>         "url": "http://localhost:3000/",
>         "type": "InstalledClient"
>     }
> ],
> "oauth2AllowIdTokenImplicitFlow": true,
> "oauth2AllowImplicitFlow": true,
> "signInAudience": "AzureADMultipleOrgs",
> ````
> 

### 4. Create a .env file

Create a `.env` file in the project's folder with the following values:

````sh
# Replace with the "Application (client) ID" value copied earlier
AUTH_CLIENT_ID=00000000-0000-0000-0000-000000000000

# Replace with the Bing Maps API key
BING_MAPS_KEY=xxx

# Leave the following values as is
AUTH_ISSUER=https://login.microsoftonline.com/{tenant}/v2.0
AUTH_URL=https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?client_id={clientId}&response_type=id_token%20token&redirect_uri={appUrl}&scope=openid%20profile%20User.read%20Calendars.read&nonce={nonce}&response_mode=fragment
GRAPH_ENDPOINT=https://graph.microsoft.com
JWKS_URL=https://login.microsoftonline.com/organizations/discovery/v2.0/keys
````

### 5. Run the app locally

You can now launch the app locally with:

````sh
npm run dev
````

You can now view the app at [http://localhost:3000](http://localhost:3000)

### 6. Build the app for production

Run:

````sh
npm run build
````

The "compiled" app will be in the `dist/` folder. That is your full SPA, and you can deploy those files anywhere you want!

## Publish on IPFS

In order to publish on IPFS, you need to have a running IPFS node. For testing, you can use your own laptop; however, in production it's recommended to maintain at least one server running IPFS 24/7 and seeding your app (and any other content you want to seed)!

> This is a simplified list of instructions. Check out this [blog post](https://withblue.ink/2018/11/14/distributed-web-host-your-website-with-ipfs-clusters-cloudflare-and-devops.html?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo) for more detailed instructions, including setting up an IPFS cluster with 3 nodes for high availability.

### Run the IPFS daemon (using Docker)

The easiest way to run the IPFS daemon is to use Docker. You'll need a Linux VM with Docker installed.

> You can get a free Linux VM with an [Azure trial account](https://azure.microsoft.com/free/open-source/?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo)

After having installed Docker, run:

````sh
sudo docker run \
  -d \
  --restart=always \
  --name=ipfs-node \
  -v /data/ipfs:/data/ipfs \
  -v /data/ipfs-staging:/staging \
  -p 4001:4001 \
  ipfs/go-ipfs:release
````

Wait a few seconds for the daemon to start, then tell IPFS to apply the "server" profile for best performance:

````sh
sudo docker exec \
  ipfs-node \
    ipfs config profile apply server
````

**Note:** if you have a firewall in front of your VM, ensure that port `4001/tcp` is open for incoming connections from anywhere, or other IPFS nodes won't be able to communicate with your server efficiently.

### Publish the app

After "compiling" the app in the previous step, copy the entire `dist/` folder to your server via SSH, and place it in the `/data/ipfs-staging` folder (full path should be something like `/data/ipfs-staging/dist`).

Then, run:

````sh
# (Note the path inside the container is just /staging)
sudo docker exec \
  ipfs-node \
    ipfs add -rQ /staging/dist
````

The command will output the multi-hash of the folder, which will look like `QmSV86hY1Qen22aWrLinNrXmhdc7LbvaFFJZW3ooj96XcU`. You can now browse the app using any public IPFS gateway, for example at: `https://gateway.ipfs.io/ipfs/QmSV86hY1Qen22aWrLinNrXmhdc7LbvaFFJZW3ooj96XcU`

#### Setting up the OAuth redirect URI

Note that authentication won't quite work yet, because we haven't set up the correct "redirect URIs" for OAuth.

In the Azure Active Directory app's configuration, add another redirect URI, pointing to the address on the IPFS gateway: `https://gateway.ipfs.io/ipfs/QmSV86hY1Qen22aWrLinNrXmhdc7LbvaFFJZW3ooj96XcU/` (don't forget the trailing slash!)

### Setting up IPNS with DNSLink

To simplify the address on IPFS and make it more memorable (as well as something that can be pointed to another document on IPFS when we update the app), we can use IPFS and DNSLink.

Setting up DNSLink requires owning a domain name and modifying the DNS records. The actual instructions on how to modify your DNS zone depend on your DNS provider.

Assuming you want to use `app.example.com` as domain name for DNSLink, as an example, you'll need to create the following DNS record:

- Name: `_dnslink.app.example.com` (a `_dnslink` subdomain on the domain you want to use)
- Type: `TXT`
- Value: `dnslink=/ipfs/QmSV86hY1Qen22aWrLinNrXmhdc7LbvaFFJZW3ooj96XcU` (replace with the IPFS content ID of your app)
- Time To Live: your choice; set to very low (e.g. 2 minutes) if you plan to update the app with relatively high frequency

After having create the DNS record, you can access your app on IPFS at: `https://gateway.ipfs.io/ipns/app.example.com` (note it says `ipns` this time!)

> Don't forget to add `https://gateway.ipfs.io/ipns/app.example.com/` (with trailing slash) to the OAuth app's list of redirect URIs in Azure AD to be able to authenticate when browsing the app at this address!

### Pointing a web domain

As you recall from the top of this "readme", the sample app is available at `https://next.italypaleale.me`, and it's served via IPFS. We can do that thanks to Cloudflare and their [Distributed Web Gateway](https://www.cloudflare.com/distributed-web-gateway/).

1. Create a DNS record with a CNAME pointing to `cloudflare-ipfs.com`. For example, to point `app.example.com`, create the following record:
    - Name: `app.example.com`
    - Type: `CNAME`
    - Destination: `cloudflare-ipfs.com` (note: some DNS servers want a period at the end, such as `cloudflare-ipfs.com.`)
    - Time To Live: whatever value makes sense for you (if you're not sure, you can use 1 hour)
    - Note: CNAME records can only be defined on sub-domains (e.g. `app.example.com`) and not on root domains (e.g. `example.com`). However, some DNS servers support the so-called "CNAME flattening", and allow you to set CNAME records on root domains too: one example is Cloudflare DNS.
2. Navigate to [www.cloudflare.com/distributed-web-gateway/?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo](https://www.cloudflare.com/distributed-web-gateway/?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo) and scroll to the bottom, looking for the "Connecting your website" section
3. Type your domain's name in the box (e.g. `app.example.com`) and submit the form, so Cloudflare can build a TLS certificate for your domain. This should take just a few seconds.

You're done! You can now browse your app directly at `https://app.example.com`

> Once again, add `https://app.example.com/` (with trailing slash) to the OAuth app's list of redirect URIs in Azure AD, or you won't be able to authenticate with the app.

## Continuous Integration and Continuous Delivery

This repository is pre-configured for setting up Continuous Integration and Continuous Delivery (CI/CD) with [Azure Pipelines](https://azure.com/pipelines?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo). Azure Pipelines is free for open source repositories (with unlimited minutes), and offers 1,800 minutes of CI/CD for private repositories.

The CI/CD job is defined in the [azure-pipelines.yaml](./azure-pipelines.yaml) file, which is thoroughly commented. At a high level, it does:

- Builds the app
- Copies the "compiled" app to the server running IPFS (via SSH), then publishes it on IPFS
- Updates the OAuth redirect URLs in Azure Active Directory to add the updated IPFS hash (and keeps the previous version too)
- Updates the value of the DNSLink record when using the Cloudflare DNS APIs (note: this requires having Cloudflare managing your DNS zone!)

### 1. Fork this repo

If you haven't already, create your own fork for this repository on GitHub.

### 2. Publish your .env file

You will need to publish the `.env` file that you created earlier in a place that's publicly accessible on the Internet (cannot require authentication). (_Note: this isn't a security risk, as the information in the `.env` file is included in your app's published code anyways_)

An idea could be to use a GitHub Gist, and then get its raw URL. For example, this is the `.env` file I'm using: `https://gist.githubusercontent.com/ItalyPaleAle/163ff6527e5a4ca3f5d65a86fa9a6daf/raw/2e15d239419f96ff7923e6521ed9c1d106a17c7a/.env`

### 3. Create a new Azure DevOps project

Azure Pipelines is part of Azure DevOps, so you'll need to create an account for [Azure Pipelines](https://azure.com/pipelines?utm_source=github&utm_medium=referral&utm_campaign=italypaleale-calendar-next-demo) and then a new project within Azure DevOps (the project's name can be your GitHub username). Signing up is free.

### 4. Setup the SSH connection

We need to set up a service connection so Azure Pipelines can connect to your VM via SSH.

1. In the left navbar, click on "Project settings" in the bottom-left corner.
2. Click on the "New service connection button"
3. Select "SSH" from the list
4. Configure the SSH connection:
    - Host name: Host name or IP address of the VM you want to connect to
    - Port number: This should normally be `22`
    - Private Key: Paste your SSH private key
    - Username: name of the user connecting to the VM via SSH
    - Password: leave empty
    - Service connection name: set this to `IPFS`
    - Grant access permission to all pipelines: Check this
5. Save the new connection

> If your VM has behind a firewall or NAT, ensure that port `22/tcp` is accessible from anywhere on the Internet.

### 5. Setup the connection to Azure

We need to authorize Azure Pipelines to connect to our Azure account, to run commands to change the list of redirect URIs in our application. For security reasons, we want to limit the permission of this account as much as possible.

To start, in the **Azure Portal** (not Azure DevOps!):

1. Search for "Azure Active Directory" (e.g. using the search bar at the top)
2. In the left blade, under "Manage", look for "App registrations"
3. Register a new application:
    - Name: set this to `Azure DevOps calendar-next CI`
    - Supported account type: "Accounts in this organizational directory only"
    - Platform configuration: "Background process and Automation (Daemon) Application"
4. After creating the app, from the information blade copy the values for **Application (client) ID** and **Directory (tenant) ID**, which we'll need shortly.
5. Under "Manage", to go "Certificates & Secrets" and create a new **Client secret**. Copy the value, which we'll use in a moment (note that you will only see that value once!).
6. Go back to the main blade of your Azure AD, and this time select "Roles and administrators" in the "Manage" section.
7. In the list, select the "Application administrator" role
8. Click on "Add assignment", then search for the app we just created ("Azure DevOps calendar-next CI") and grant it access

Because of a current issue with the Azure CLI task in Azure Pipelines ([see microsoft/azure-pipelines-tasks#11846](https://github.com/microsoft/azure-pipelines-tasks/issues/11846)), we need to create an empty Resource Group and grant our application access to it.

1. In the Azure Portal, in the left navbar go to "Resource groups"
2. Click on "Add" to create a new Resource Group. The name and location are irrelevant.
3. Open the newly-created, empty Resource Group and select "Access control (IAM)"
4. Click on the "Add" button, then choose "Add role assignment"
5. Select "Reader" as role
6. Choose "Azure AD user, group or service principal" under "Assign access to"
7. In the search box, type the name of the app we just created ("Azure DevOps calendar-next CI") and grant it access

We're finally ready to create the connection inside the Azure DevOps portal. In the same page as before (Project Settings -> Pipelines -> Service connections), click on "New service connection".

1. Choose "Azure Resource Manager"
2. From the radio buttons, choose "Service Principal Authentication" (the default)
3. Skip to the bottom and look for the link named "use the full version of the service connection dialog"
4. Then, configure the connection as:
    - Connection name: set this to `Azure calendar-next CI`
    - Environment: choose AzureCloud
    - Scope level: choose Subscription
    - Subscription: the ID of your Azure subscription; should be auto-populated. If not, you can find it in the Azure Portal, looking in the "Subscriptions" section, and selecting the subscription you're using.
    - Service principal client ID: This is the "Application (client) ID" for the app we just created ("Azure DevOps calendar-next CI")
    - Service principal key: This is the "Client secret" for the app we just created
    - Tenant ID: should be auto-populated; it should match the value of the "Directory (tenant) ID" for the app we just created
    - Select "Allow all pipelines to use this connection"
5. Save the connection

### 6. Cloudflare API key

If you want to automatically update your DNSLink value, and Cloudflare manages your domain's DNS zone, the CI's last step can do it automatically for you. You need to provide credentials to authorize the CI.

**TODO**

### 7. Create a new Pipeline

In the left navar, select Pipelines, then Pipelines, and click on the "New Pipeline" button.

1. Select "GitHub (YAML)" as a location for your code. You might need to authenticate with GitHub and authorize the Azure Pipelines app if you haven't already.
2. Select your repository on GitHub.
3. In the "Configure your pipeline", choose "Existing Azure Pipelines YAML file:
    - Branch: `master`
    - Path: `/azure-pipelines.yaml`
4. Click on the "Variables" button to create a few variables:
    1. Application (client) ID of the OAuth app we just created ("Azure DevOps calendar-next CI"), which can change the configuration of Azure AD:
        - Name: `AAD_APPLICATION_ID`
        - Value: the "Application (client) ID" of the app
        - Keep this value secret: Do not check
    2. The path to the `.env` file:
        - Name: `DOTENV_FILE`
        - Value: the URL of the `.env` file, e.g. the raw URL of the GitHub Gist
        - Keep this value secret: Do not check
    3. Domain name for DNSLink:
        - Name: `DOMAIN`
        - Value: the domain name (e.g. `app.example.com`)
        - Keep this value secret: Do not check
    4. Cloudflare API token:
        - Name: `CLOUDFLARE_API_TOKEN`
        - Value: the value of the API token generated by Cloudflare
        - Keep this value secret: Check this
    5. Cloudflare zone ID
        - Name: `CLOUDFLARE_ZONE_ID`
        - Value: the value of the DNS zone ID for Cloudflare
        - Keep this value secret: Check this
5. Save, then run the pipeline.

You're done! The pipeline should run, and your app should be automatically deployed on every single code commit.
