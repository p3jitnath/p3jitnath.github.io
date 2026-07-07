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
- Do not rely on concurrent writes to the same file from multiple hosts; use job staging, file locking, or atomic rename/move operations.
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
