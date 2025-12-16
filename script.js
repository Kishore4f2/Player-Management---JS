async function showdata() {
    let res = await fetch("https://player-management-js.onrender.com/Data");
    let data = await res.json();
    getData(data);
}
function getData(data) {
    let div1 = document.getElementById("main");
    div1.innerHTML = "";

    data.forEach(player => {
        let div = document.createElement("div");

        div.innerHTML = `
            <h3>ID: ${player.id}</h3>
            <p>Jersey No: ${player.JerseyNo}</p>
            <p>Name: ${player.Name}</p>
            <img src= ${player.image}>
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
        `;

        div1.appendChild(div);

        div.querySelector(".delete").onclick = async () => {
            await fetch(`https://player-management-js.onrender.com/Data/${player.id}`, {
                method: "DELETE"
            });
            showdata();
        };

        div.querySelector(".edit").onclick = () => {
            document.getElementById("id").value = player.id;
            document.getElementById("JerseyNo").value = player.JerseyNo;
            document.getElementById("Name").value = player.Name;
            document.getElementById("image").value = player.image;
        };
    });
}

document.querySelector("button").addEventListener("click", async () => {
    let id = document.getElementById("id").value;
    let JerseyNo = document.getElementById("JerseyNo").value;
    let name = document.getElementById("Name").value;
    let image = document.getElementById("image").value;

    if (!id || !name || !JerseyNo || !image) {
        alert("Please enter ID, JerseyNo, image and Name");
        return;
    }

    let res = await fetch(`https://player-management-js.onrender.com/Data/${id}`);

    if (res.ok) {
        await fetch(`https://player-management-js.onrender.com/Data/${id}`, {
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
    } else {
        await fetch("https://player-management-js.onrender.com/Data", {
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
    }

    document.getElementById("id").value = "id";
    document.getElementById("JerseyNo").value = "JerseyNo";
    document.getElementById("Name").value = "name";
    document.getElementById("image").value = "image";

    showdata();
});

document.addEventListener("DOMContentLoaded", showdata);
