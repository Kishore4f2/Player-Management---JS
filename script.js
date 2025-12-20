// Check authentication
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'login.html';
}

const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user.role === 'admin';

document.addEventListener('DOMContentLoaded', () => {
    // Hide Add Form if not admin
    if (!isAdmin) {
        const formContainer = document.querySelector('.form-container');
        if (formContainer) formContainer.style.display = 'none';

        // Also hide Manage Users just in case
        const usersSection = document.getElementById('users-section');
        if (usersSection) usersSection.style.display = 'none';
    } else {
        // Show Users Section if Admin
        const usersSection = document.getElementById('users-section');
        if (usersSection) {
            usersSection.style.display = 'block';
            showUsers();
        }
    }
});

// Logout function

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user'); // Clear user data too
    window.location.href = 'login.html';
}

async function showdata() {
    let res = await fetch("/Data"); // Use local relative path
    let data = await res.json();
    getData(data);
}
function getData(data) {
    let div1 = document.getElementById("main");
    div1.innerHTML = "";

    data.forEach(player => {
        let div = document.createElement("div");

        let buttonsHtml = '';
        if (isAdmin) {
            buttonsHtml = `
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
            `;
        }

        div.innerHTML = `
            <h3>ID: ${player.id}</h3>
            <p>Jersey No: ${player.JerseyNo}</p>
            <p>Name: ${player.Name}</p>
            <img src= ${player.image}>
            ${buttonsHtml}
        `;

        div1.appendChild(div);

        if (isAdmin) {
            div.querySelector(".delete").onclick = async () => {
                await fetch(`/Data/${player.id}`, {
                    method: "DELETE"
                });
                alert("Player deleted successfully! 🗑️");
                showdata();
            };

            div.querySelector(".edit").onclick = () => {
                document.getElementById("id").value = player.id;
                document.getElementById("JerseyNo").value = player.JerseyNo;
                document.getElementById("Name").value = player.Name;
                document.getElementById("image").value = player.image;

                // Scroll to top to see form
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
    });
}


document.querySelector("button.submit-btn").addEventListener("click", async () => {
    if (!isAdmin) return; // Prevent non-admins

    let id = document.getElementById("id").value;
    let JerseyNo = document.getElementById("JerseyNo").value;
    let name = document.getElementById("Name").value;
    let image = document.getElementById("image").value;

    if (!id || !name || !JerseyNo || !image) {
        alert("Please enter ID, JerseyNo, image and Name");
        return;
    }

    let res = await fetch(`/Data/${id}`);

    if (res.ok) {
        await fetch(`/Data/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Name: name,
                JerseyNo: JerseyNo,
                image: image
            })
        });
        alert("Player details updated successfully! 📝");
    } else {
        await fetch("/Data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                JerseyNo: JerseyNo,
                Name: name,
                image: image
            })
        });
        alert("Player added successfully! 🎉");
    }

    document.getElementById("id").value = "";
    document.getElementById("JerseyNo").value = "";
    document.getElementById("Name").value = "";
    document.getElementById("image").value = "";

    showdata();
});

document.addEventListener("DOMContentLoaded", showdata);

// Function to fetch and show users
async function showUsers() {
    try {
        const res = await fetch('/users');
        const users = await res.json();
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';

        users.forEach(u => {
            const div = document.createElement('div');
            // Reusing card style but simpler
            div.style.background = 'rgba(255, 255, 255, 0.05)';
            div.style.padding = '1.5rem';
            div.style.borderRadius = '15px';
            div.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.gap = '0.5rem';

            const isSelf = u.email === user.email;
            const roleColor = u.role === 'admin' ? '#d4af37' : '#94a3b8';

            div.innerHTML = `
                <h3 style="color: white; margin: 0;">${u.name}</h3>
                <p style="color: #cbd5e1; font-size: 0.9rem;">${u.email}</p>
                <p style="color: ${roleColor}; font-weight: bold; text-transform: uppercase; font-size: 0.8rem;">${u.role}</p>
                ${!isSelf ? `
                    <button class="role-btn" data-id="${u.id}" data-role="${u.role}" 
                        style="
                            margin-top: 0.5rem; 
                            padding: 0.5rem; 
                            border: 1px solid ${u.role === 'admin' ? '#ef4444' : '#d4af37'}; 
                            background: transparent; 
                            color: ${u.role === 'admin' ? '#ef4444' : '#d4af37'}; 
                            border-radius: 5px; 
                            cursor: pointer;
                            font-weight: 600;
                        ">
                        ${u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                ` : ''}
            `;

            usersList.appendChild(div);

            const btn = div.querySelector('.role-btn');
            if (btn) {
                btn.onclick = async () => {
                    const newRole = btn.dataset.role === 'admin' ? 'user' : 'admin';
                    if (confirm(`Are you sure you want to change role to ${newRole}?`)) {
                        await updateUserRole(u.id, newRole);
                    }
                };
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function updateUserRole(id, role) {
    try {
        const res = await fetch(`/users/${id}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });

        if (res.ok) {
            alert('User role updated successfully');
            showUsers();
        } else {
            alert('Failed to update role');
        }
    } catch (error) {
        console.error(error);
        alert('Error updating role');
    }
}
