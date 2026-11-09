---
title: JASMIN Setup Tutorial
layout: page
description: A short tutorial for setting up and using JASMIN, the UK data analysis facility for environmental science, providing petascale storage and HPC resources.
image: /assets/images/cambridge-crest.jpg
---

<!-- JASMIN Setup two-column layout: left nav + content -->
<div class="about-layout">
  <aside class="about-nav" aria-label="JASMIN Setup sections">
    <h2 class="nav-title">JASMIN Setup Tutorial</h2>
    <nav>
      <ul>
        <li><a href="#introduction">Introduction</a></li>
        <li><a href="#account-setup">Account Setup</a></li>
        <li><a href="#ssh-configuration">SSH Configuration</a></li>
        <li><a href="#storage-access">Storage Access</a></li>
        <li><a href="#vscode-access">Access via VSCode</a></li>
        <li><a href="#using-codex">Using Codex</a></li>
        <li><a href="#running-jobs">Running Jobs</a></li>
        <li><a href="#best-practices">Best Practices</a></li>
        <li><a href="#troubleshooting">Troubleshooting</a></li>
      </ul>
    </nav>
    <div class="tutorial-progress" role="progressbar" aria-label="Tutorial progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0%">
      <div class="tutorial-progress-bar"></div>
    </div>
    <span class="tutorial-progress-label" aria-hidden="true">0%</span>
  </aside>

  <div class="about-content" markdown="1">

<!-- Introduction -->

<div class="about-section active" data-section="introduction" markdown="1">

## Introduction {#introduction}

[JASMIN](https://jasmin.ac.uk/) is a UK data analysis facility for environmental science, providing petascale storage and high-performance computing (HPC) resources. This tutorial will walk you through the essential steps to get started with JASMIN.

**What you'll learn:**
- How to set up your JASMIN account
- Configuring SSH access
- Navigating the storage systems
- Accessing via Visual Studio Code
- Using Codex from the terminal and the ChatGPT phone app
- Submitting and managing batch jobs
- Best practices for efficient use
- Tips for troubleshooting

**Prerequisites:**
- A valid JASMIN account
- SSH client installed on your local machine
- Basic Linux/Unix command line knowledge

**Time Commitment:** 30 mins

</div>

<!-- Account Setup -->

<div class="about-section" data-section="account-setup" markdown="1">

## Account Setup {#account-setup}

### Creating Your Account

1. Visit the [JASMIN Accounts Portal](https://accounts.jasmin.ac.uk/)
2. Register using your institutional email address
3. Wait for account approval (typically 1-2 working days)
4. Set up two-factor authentication (2FA)

### Generating SSH Keys

Generate an SSH key pair on your local machine:

```bash
ssh-keygen -t rsa -b 4096 -C "your.email@institution.ac.uk" -f ~/.ssh/id_rsa_jasmin
```

Notes:

- This will create the files `~/.ssh/id_rsa_jasmin` (private key) and `~/.ssh/id_rsa_jasmin.pub` (public key).
- If you want a key without a passphrase (convenient but less secure), you can press Enter twice when prompted for a passphrase — the first Enter to leave the passphrase blank and the second to confirm. 
- If you do set a passphrase, you will need to enter it each time the key is used (unless you use an ssh-agent).

**Security Recommendation:** For interactive use it's common to use an ssh-agent (e.g., `ssh-agent` + `ssh-add`) so you only enter the passphrase once per session rather than on every connection.

### Uploading Your Public Key

1. Log in to the JASMIN Accounts Portal
2. Navigate to "SSH Public Key" section and press "Update key"
3. Upload your public key (`~/.ssh/id_rsa_jasmin.pub`)
4. Wait for key approval (usually within 24 hours)

### Requesting Access Services

Apply for the services you need:
- `jasmin-login` - Basic login access + [LOTUS CPU-only cluster](https://help.jasmin.ac.uk/docs/batch-computing/lotus-overview/)
- Group workspaces - Project-specific storage
- [Orchid - GPU cluster](https://help.jasmin.ac.uk/docs/batch-computing/orchid-gpu-cluster/)

</div>

<!-- SSH Configuration -->

<div class="about-section" data-section="ssh-configuration" markdown="1">

## SSH Configuration {#ssh-configuration}

### Basic SSH Connection

Connect to JASMIN login servers:

```bash
ssh -A username@login.jasmin.ac.uk -i ~/.ssh/id_rsa_jasmin
```

The `-A` flag enables SSH agent forwarding and `-i` flag points to the specific private key for authentication.

### SSH Config File

Create a `~/.ssh/config` file for easier access:

```
Host login.jasmin.ac.uk
    HostName login.jasmin.ac.uk
    User username
    IdentityFile ~/.ssh/id_rsa_jasmin

Host gpuhost*
    HostName %h.jc.rl.ac.uk
    User username
    ProxyJump username@login.jasmin.ac.uk
    IdentityFile ~/.ssh/id_rsa_jasmin

Host *.jasmin
    HostName %h.ac.uk
    User username
    ProxyJump username@login.jasmin.ac.uk
    IdentityFile ~/.ssh/id_rsa_jasmin

Host *
    ServerAliveInterval 1
    ServerAliveCountMax 60000
    TCPKeepAlive no
    XAuthLocation /opt/X11/bin/xauth
    ForwardAgent yes
    ForwardX11 yes
```

Now you can simply use:

```bash
ssh sci-vm-03.jasmin
```

### Troubleshooting Connection Issues

Common issues and solutions:

- **"Permission denied"** - Check if your public key is approved
- **"Host key verification failed"** - Remove old host key: `ssh-keygen -R login.jasmin.ac.uk`
- **Timeout errors** - Check your network allows SSH (port 22)

</div>

<!-- Storage Access -->

<div class="about-section" data-section="storage-access" markdown="1">

## Storage Access {#storage-access}

### Home Directory

Your home directory (`/home/users/username`) has limited quota:
- Default: 100 GB
- Use for configuration files and small scripts
- Not suitable for large datasets

### Group Workspaces (GWS)

Project storage locations:
```
/gws/ssde/j25a/gws_name/
```

Features:
- Large storage capacity (TBs)
- Shared among team members
- Regular backups
- High I/O performance

For work inside the GWS, please do consider making a `username` folder under `/users` and treating as your pseudo-home directory.

### Scratch Space

Temporary storage for active computations:
```
/work/scratch-pw3/username/
```

**Warning:** Files are automatically deleted after 28 days.


### Networked Filesystems

JASMIN storage is a networked/shared filesystem: the same mount points (e.g., `/gws/...` and `/work/...`) are presented on all login and compute hosts. That means files written on one host (e.g., `sci-vm-01`) are visible from another host (e.g., `sci-vm-02`) without copying. 

Notes:
- Do not rely on concurrent writes to the same file from multiple hosts. Use job staging, file locking, or atomic rename/move operations.
- For very heavy or latency-sensitive I/O, prefer local scratch and then copy results back to the shared storage when finished.


### Helpful Links

- [JASMIN Storage](https://help.jasmin.ac.uk/docs/getting-started/understanding-new-jasmin-storage/)

</div>

<!-- Access via VSCode -->

<div class="about-section" data-section="vscode-access" markdown="1">

## Access via VSCode {#vscode-access}

Visual Studio Code provides a seamless way to work on JASMIN hosts using the Remote SSH extension. This allows you to edit code, run scripts, and use Jupyter notebooks directly on JASMIN as if you were working locally.

### Installing Remote SSH Extension Pack

1. Open VS Code on your local machine
2. Go to the Extensions view (Ctrl+Shift+X or ⌘+Shift+X on Mac)
3. Search for "Remote - SSH" or install the full "Remote Development" extension pack
4. Click Install

**Recommended:** Install the full [Remote Development Extension Pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) which includes:
- Remote - SSH
- Remote - Tunnels
- WSL (Windows Subsystem for Linux)
- Dev Containers

### Connecting to JASMIN

1. Make sure your `~/.ssh/config` file is properly configured (see [SSH Configuration](#ssh-configuration))
2. Click the green "Remote" button in the bottom-left corner of VS Code (looks like `><`)
3. Select "Connect to Host..."
4. Choose your JASMIN host from the list (e.g., `sci-vm-01.jasmin`)
5. VS Code will open a new window and connect via SSH

**Note:** On first connection, VS Code will install its server components on the remote host. This is a one-time setup and may take a minute.

### Using the Remote Session

Once connected:

- **File Explorer:** Browse and edit files on JASMIN directly
- **Integrated Terminal:** Open a terminal (`` Ctrl+` ``) to run commands on the remote host
- **Extensions:** Install extensions in the remote environment (Python, Jupyter, etc.)
- **Source Control:** Use Git directly on JASMIN
- **Port Forwarding:** Forward ports for web apps, notebooks, or dashboards

### Setting Up Jupyter in VS Code

1. **Connect to JASMIN** via Remote SSH (as described above)

2. **Install Python extension** on the remote host:
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Python" (by Microsoft)
   - Click "Install in SSH: sci-vm-01.jasmin"

3. **Install Jupyter extension** on the remote host:
   - Search for "Jupyter" (by Microsoft)
   - Click "Install in SSH: sci-vm-01.jasmin"

4. **Select Python interpreter:**
   - Press Ctrl+Shift+P (⌘+Shift+P on Mac)
   - Type "Python: Select Interpreter"
   - Choose the jaspy environment or your conda environment

5. **Create or open a notebook:**
   - Create a new `.ipynb` file or open an existing one
   - VS Code will automatically connect to a Jupyter kernel

### Using JupyterLab (Alternative)

If you prefer the full JupyterLab interface:

1. **[Optional: Skip if using VSCode] SSH into JASMIN** and start JupyterLab with port forwarding:

   ```bash
   ssh -L 8888:localhost:8888 sci-vm-01.jasmin
   ```

2. **Load Python environment:**

   ```bash
   module load jaspy
   # or activate your conda environment
   conda activate myenv
   ```

3. **Start JupyterLab:**

   ```bash
   jupyter lab --no-browser --port=8888
   ```

4. **Copy the token URL** shown in the terminal (looks like `http://localhost:8888/?token=...`)

5. **Open in your local browser** and paste the URL

**Handy Tips:**

- **Persistent sessions:** Use `tmux` or `screen` to keep JupyterLab running after disconnecting:
  ```bash
  tmux new -s jupyter
  jupyter lab --no-browser --port=8888
  # Press Ctrl+B then D to detach
  # Reconnect later with: tmux attach -t jupyter
  ```

- **Custom port:** If 8888 is in use, try another port (e.g., 8889):
  ```bash
  ssh -L 8889:localhost:8889 sci-vm-01.jasmin
  jupyter lab --no-browser --port=8889
  ```

- **VS Code port forwarding:** When connected via Remote SSH, you can forward ports through the VS Code UI:
  - Open the Ports panel (View > Output > Ports)
  - Click "Forward a Port"
  - Enter 8888 and access JupyterLab at `http://localhost:8888`

### Common Issues

**Problem:** "Could not establish connection to host"

**Solution:**
- Verify SSH connection works in terminal first: `ssh sci-vm-01.jasmin`
- Check `~/.ssh/config` syntax
- Ensure your SSH key is loaded: `ssh-add -l`
- If not, then follow [SSH Configuration](#ssh-configuration) 

**Problem:** Extensions not working on remote

**Solution:**
- Extensions must be installed separately for the remote host
- Look for "Install in SSH: hostname" button in Extensions view

</div>

<!-- Using Codex -->

<div class="about-section" data-section="using-codex" markdown="1">

## Using Codex {#using-codex}

Codex can read your project, explain code, make edits, and run commands in your JASMIN environment. The CLI runs on the host where you launch it. Requests to the model go to OpenAI. Start in your own project directory and use an account with Codex access.

**Workspace note:** `$GWS` represents your personal directory in a group workspace. Replace `gws_name` and `username` below with your own values, then set it in your JASMIN shell:

```bash
export GWS="/gws/ssde/j25a/gws_name/users/username"
```

The examples below use `$GWS` instead of repeating that path. Add this export to your shell startup file if you want it to be available after reconnecting.

### Download and install the CLI

Connect to a science host using the [SSH configuration above](#ssh-configuration):

```bash
ssh sci-vm-03.jasmin
```

In that remote terminal, run the official Linux installer:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
codex --version
```

Keep the PATH entry in your shell startup file if it is not already there, so `codex` is available after reconnecting. See the [official CLI installation guide](https://learn.chatgpt.com/docs/codex/cli#1-install-codex).

Update an existing installation with:

```bash
codex update
```

See the [update command reference](https://learn.chatgpt.com/docs/developer-commands#codex-update).

### Sign in with a device code

A JASMIN terminal normally has no browser to complete a local login callback. Device-code authentication lets you approve the login in a browser on your laptop or phone instead.

```bash
codex login --device-auth
```

1. Open the URL printed in the terminal on your laptop or phone.
2. Sign in to the ChatGPT account and workspace you want to use.
3. Enter the one-time device code shown by the CLI and finish verification.
4. Return to the JASMIN terminal and confirm the login:

   ```bash
   codex login status
   ```

If device-code login is disabled, enable it in your ChatGPT security settings or ask your workspace administrator to enable it. Keep the code and cached credentials private. The [authentication guide](https://learn.chatgpt.com/docs/auth#login-on-headless-devices) also describes an SSH callback-forwarding alternative.

### Choose a model and reasoning effort

Open your project and start Codex:

```bash
cd "$GWS/my-project"
codex
```

**Recommended: GPT 6.1 Sol with Max reasoning effort.** In the interactive session, type `/model`, select **GPT 6.1 Sol**, then choose **More reasoning…** and **Max** if available.

**For writing, I recommend GPT 6.1 Terra with Max reasoning effort.** It is a good option for drafting and revising clear prose, including proposals and reports. Select **GPT 6.1 Terra** with `/model`, then choose **More reasoning…** and **Max** if available.

Max gives the model more time to reason and can increase response time and usage.

Other models you may see include:

- **GPT-6 Astra:** an alternative for demanding debugging, research, or work involving several tools and difficult decisions.
- **GPT-6 Luna:** an alternative for focused, repeatable tasks such as small edits and structured extraction.

Model and reasoning-effort availability depend on your plan, workspace, and client. See the [current model guide](https://learn.chatgpt.com/docs/models#choosing-a-model).

To launch a session with the recommended model and reasoning effort:

```bash
codex --model gpt-6.1-sol -c 'model_reasoning_effort="max"'
```

For a writing session with Terra Max:

```bash
codex --model gpt-6.1-terra -c 'model_reasoning_effort="max"'
```

To keep Sol Max as the default, add or update these entries in `~/.codex/config.toml`:

```toml
model = "gpt-6.1-sol"
model_reasoning_effort = "max"
```

### Why `--yolo` matters

For unattended terminal work, repeated approval prompts can interrupt progress. The `--yolo` flag lets Codex execute shell commands without those approval pauses:

```bash
codex --yolo --model gpt-6.1-sol -c 'model_reasoning_effort="max"'
```

This can be useful when you deliberately want Codex to complete a task while you are away from the terminal. **It also disables the execution sandbox:** `--yolo` is an alias for `--dangerously-bypass-approvals-and-sandbox`. Commands can use the files, network, and permissions available to your JASMIN account, including writable files outside the project directory.

Use it only for trusted work whose actions you are comfortable delegating, keep recoverable Git checkpoints, and review the results. To avoid shell approval prompts while retaining the workspace sandbox, use `codex --sandbox workspace-write --ask-for-approval never` instead. See the [official permissions guide](https://learn.chatgpt.com/docs/agent-approvals-security#common-sandbox-and-approval-combinations).

`--yolo` controls the terminal session launched with that flag. Remote pairing does not require it. Choose the permissions for tasks started from your phone in the remote session.

### Skills

Skills give Codex reusable instructions for recurring tasks. These repositories provide skills for research and development workflows. Follow each repository's README for installation and usage:

1. [graph-plotting-skill](https://github.com/p3jitnath/graph-plotting-skill)
2. [paper-writing-skill](https://github.com/p3jitnath/paper-writing-skill)
3. [proof-reading-skill](https://github.com/p3jitnath/proof-reading-skill)
4. [poster-drafting-skill](https://github.com/p3jitnath/poster-drafting-skill)
5. [website-design-skill](https://github.com/p3jitnath/website-design-skill)

### Start a task and return to it later

A useful first prompt is:

```text
Explain this repository and its environment requirements. Then help me
prepare a SLURM job script for the existing training code.
```

Review proposed commands and changes. Keep large simulations and training jobs in [SLURM](#running-jobs), rather than running them on a login host. Activate your project's environment before starting Codex when it needs those tools.

For a terminal session that survives SSH disconnection, start Codex inside `tmux`:

```bash
tmux new -s codex
codex
```

Detach with **Ctrl+B**, then **D**. After reconnecting, run `tmux attach -t codex`. To reopen a saved Codex conversation after the CLI has exited, run `codex resume` from the project directory.

### Configure Remote on your phone

Connect the ChatGPT phone app directly to the Codex server on JASMIN using `remote-control`. After installing Codex and signing in on the science host, run:

```bash
codex remote-control start
codex remote-control pair
```

The first command starts the app-server daemon with remote control enabled. The second prints a short-lived pairing code.

1. Update the ChatGPT app on your phone and sign in to the same account and workspace used on JASMIN.
2. Open **Codex**, or **Remote** if your version uses that label.
3. Start the host-connection flow, select manual-code pairing, and enter the code printed by `codex remote-control pair` before it expires.
4. Once paired, select the JASMIN host and your project directory, such as `$GWS/my-project`. Use the expanded path if the app does not expand shell variables.
5. Start or continue a task. From your phone, you can send instructions, choose task permissions, review changes, and respond to approval requests.

The pairing code connects your phone to the host. It is different from the device code used to sign in earlier. Keep it private. If it expires, run `codex remote-control pair` again. Keep the JASMIN host online and the daemon running while you use Remote. The `start` command runs it in the background.

When finished with the remote-control daemon, stop it with:

```bash
codex remote-control stop
```

The CLI command is currently marked experimental and requires a phone app with compatible manual pairing. Availability depends on your account, workspace settings, and app versions. See the [remote-control command reference](https://learn.chatgpt.com/docs/developer-commands#codex-remote-control) and [mobile pairing release notes](https://learn.chatgpt.com/docs/changelog).

### LLM policy

For helpful guidance on using LLMs in research and manuscript preparation, I suggest the [NeurIPS 2025 LLM policy](https://neurips.cc/Conferences/2025/LLM) as a reference. Always double-check your university's LLM policy and the rules of the journal, conference, or other venue you are submitting to. Requirements may differ, including by year and track.

</div>

<!-- Running Jobs -->

<div class="about-section" data-section="running-jobs" markdown="1">

## Running Jobs {#running-jobs}

### SLURM Batch System

JASMIN uses SLURM for job scheduling.

### Example Job Script

Create a file `job_script.sh`:

```bash
#!/bin/bash
#SBATCH --job-name=test
#SBATCH --output=%j.out
#SBATCH --error=%j.err
#SBATCH --time=01:00:00
#SBATCH --mem=4G
#SBATCH --account=gws_name
#SBATCH --partition=standard
#SBATCH --qos=high

# Load modules
module load jaspy

# Run your code
python test.py
```

### Submitting Jobs

```bash
sbatch job_script.sh
```

### Monitoring Jobs

```bash
# Check queue status
squeue -u $USER

# Check job details
scontrol show job JOBID

# Cancel a job
scancel JOBID
```

### Helpful Links

- [SLURM Queues](https://help.jasmin.ac.uk/docs/batch-computing/slurm-queues/)

</div>

<!-- Best Practices -->

<div class="about-section" data-section="best-practices" markdown="1">

## Best Practices {#best-practices}

### Data Management

1. **Keep home directory clean** - Work and also keep large files (e.g., datasets) in GWS
2. **Use scratch wisely** - Only for temporary files
3. **Regular backups** - GWS is backed up, scratch is not
4. **Compress old data** - Use gzip or tar to save space

### Efficient Computing

1. **Test jobs locally first** - Debug on `sci-vm-*` nodes with small datasets
2. **Request appropriate resources** - Don't over-request memory/time
3. **Use parallel processing** - Leverage multiple cores when possible
4. **Monitor resource usage** - Check job efficiency with `seff JOBID`
5. **Conda environments** - Create a seperate `conda` environment for each project.

### Environment Management

Use Conda or virtual environments:

```bash
# Load jaspy (pre-installed Python environment)
module load jaspy

# Or create your own environment
conda create -n venv python=3.11
conda activate venv
```

### Courtesy to Other Users

- Do NOT run compute-intensive tasks on login nodes
- Clean up scratch space regularly (if used)
- Be mindful of storage quotas
- Report issues to JASMIN helpdesk

</div>

<!-- Troubleshooting -->

<div class="about-section" data-section="troubleshooting" markdown="1">

## Troubleshooting {#troubleshooting}

### Common Issues

**Problem:** "Disk quota exceeded"
   
**Solution:**
```bash
# Check your quota
quota -s

# Find large files
du -sh * | sort -hr | head -20
```

**Problem:** SSH connection drops frequently
   
**Solution:**
Add to `~/.ssh/config` :
```
Host *
        ...
        ServerAliveInterval 60
        ServerAliveCountMax 3
```

**Problem:** Job fails immediately

**Solution:**
- Check output/error files
- Verify module dependencies
- Test script interactively first


### Getting Help

1. **JASMIN Documentation**: [https://help.jasmin.ac.uk/](https://help.jasmin.ac.uk/)
2. **JASMIN Helpdesk**: [support@jasmin.ac.uk](mailto:support@jasmin.ac.uk)
3. **Community Forum**: Reach out to local JASMIN users in your research group.

### Useful Commands

```bash
# Check available modules
module avail

# Check storage usage
df -h /gws/ssde/j25a/gws_name

# List running jobs
squeue -u $USER

# Check system status
sinfo
```

### Emergency Contacts

- **JASMIN Helpdesk**: support@jasmin.ac.uk
- **Out of hours emergencies**: Check JASMIN status page

</div>

<!-- .about-section (last) -->
<!-- .about-content -->
  </div>
</div> <!-- .about-layout -->

<script src="{{ site.url }}/assets/js/about.js"></script>
<script src="{{ site.url }}/assets/js/copy-code.js"></script>
