---
description: How to upload the project to GitHub
---

# Upload to GitHub

Follow these steps to upload your project to GitHub.

1.  **Initialize Git** (if not already done):
    Open a terminal in your project root (`c:\Users\Windows 2025\Documents\proyecto-hotel\proyecto-hotel`) and run:
    ```bash
    git init
    ```

2.  **Add files to staging:**
    ```bash
    git add .
    ```

3.  **Commit the changes:**
    ```bash
    git commit -m "Initial upload: Complete hotel management system"
    ```

4.  **Create a Repository on GitHub:**
    - Go to [GitHub.com](https://github.com) and log in.
    - Click the "+" icon in the top right and select "New repository".
    - Name it (e.g., `proyecto-hotel`), choose Public or Private, and click "Create repository".

5.  **Link your local project to GitHub:**
    Copy the URL of your new repository (e.g., `https://github.com/tu-usuario/proyecto-hotel.git`) and run this command (replace the URL):
    ```bash
    git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
    git branch -M main
    git push -u origin main
    ```

> [!NOTE]
> If you don't have the `git` command installed, you will need to install [Git for Windows](https://git-scm.com/download/win) first.
