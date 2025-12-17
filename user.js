async function showdata() {
    try {
        let res = await fetch("https://player-management-js.onrender.com/Data");
        let data = await res.json();
        getData(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
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
            <img src="${player.image}" alt="${player.Name}">
        `;

        div1.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", showdata);
