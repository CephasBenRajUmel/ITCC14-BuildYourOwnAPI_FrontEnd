const API_URL = "https://itcc14-buildyourownapi.onrender.com/games";

console.log("SCRIPT.JS LOADED");

const resultsPage = document.getElementById("results");

async function loadGames() {
    resultsPage.innerHTML = `<p class="loading">Loading games...</p>`;

    try {
        const response = await fetch(API_URL);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.Error || "Failed to load games");
        }

        resultsPage.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            resultsPage.innerHTML = `<p>No games found.</p>`;
            return;
        }

        data.forEach(game => {
            createGameCard(game);
        });

    } catch (error) {
        console.error("Load games error:", error);
        resultsPage.innerHTML = `
            <div class="error">
                <p>Could not load games.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function createGameCard(game) {

    const card = document.createElement("div");

    card.classList.add("game-card");

    card.innerHTML = `
        <div class="game-info">

            <h2>${escapeHTML(game.title)}</h2>

            <p>
                <strong>Genre:</strong>
                ${escapeHTML(game.genre)}
            </p>

            <p>
                <strong>Platform:</strong>
                ${escapeHTML(game.platform)}
            </p>

            <p>
                <strong>Release Year:</strong>
                ${game.release_year}
            </p>

            <p>
                <strong>Developer:</strong>
                ${escapeHTML(game.developer)}
            </p>

            <p class="rating">
                ⭐ ${game.rating}
            </p>

            <div class="game-actions">

                <button onclick="viewGame(${game.id})">
                    View
                </button>

                <button onclick="showEditForm(${game.id})">
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteGame(${game.id})">
                    Delete
                </button>

            </div>

        </div>
    `;

    resultsPage.appendChild(card);
}

async function viewGame(id) {

    resultsPage.innerHTML = `<p class="loading">Loading game...</p>`;

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (response.status === 404) {
            resultsPage.innerHTML = `
                <div class="error">
                    <h2>Game Not Found</h2>
                    <p>The game you are looking for does not exist.</p>
                    <button onclick="loadGames()">Back to Games</button>
                </div>
            `;
            return;
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.Error ||
                "Failed to load game"
            );
        }

        resultsPage.innerHTML = `
            <div class="game-detail">
                <button onclick="loadGames()"> ← Back to Games </button>

                <h1>${escapeHTML(data.title)}</h1>
                <p>
                    <strong>Genre:</strong>
                    ${escapeHTML(data.genre)}
                </p>

                <p>
                    <strong>Platform:</strong>
                    ${escapeHTML(data.platform)}
                </p>

                <p>
                    <strong>Release Year:</strong>
                    ${data.release_year}
                </p>

                <p>
                    <strong>Developer:</strong>
                    ${escapeHTML(data.developer)}
                </p>

                <p>
                    <strong>Rating:</strong>
                    ⭐ ${data.rating}
                </p>

                <div class="game-actions">
                    <button onclick="showEditForm(${data.id})">
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteGame(${data.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;

    } catch (error) {

        console.error("View game error:", error);

        resultsPage.innerHTML = `
            <div class="error">
                <h2>Something went wrong</h2>
                <p>${error.message}</p>
                <button onclick="loadGames()">
                    Back to Games
                </button>
            </div>
        `;
    }
}

function showAddForm() {

    resultsPage.innerHTML = `

        <div class="form-container">

            <h1>Add New Game</h1>

            <div id="form-error"></div>

            <form id="add-game-form">

                <label>
                    Title
                    <input
                        type="text"
                        id="title"
                        required
                    >
                </label>

                <label>
                    Genre
                    <input
                        type="text"
                        id="genre"
                        required
                    >
                </label>

                <label>
                    Platform
                    <input
                        type="text"
                        id="platform"
                        required
                    >
                </label>

                <label>
                    Release Year
                    <input
                        type="number"
                        id="release_year"
                        required
                    >
                </label>

                <label>
                    Developer
                    <input
                        type="text"
                        id="developer"
                        required
                    >
                </label>

                <label>
                    Rating
                    <input
                        type="number"
                        id="rating"
                        step="0.1"
                        min="0"
                        max="10"
                        required
                    >
                </label>

                <div class="form-actions">

                    <button type="submit">
                        Add Game
                    </button>

                    <button
                        type="button"
                        onclick="loadGames()">
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    `;

    document
        .getElementById("add-game-form")
        .addEventListener("submit", createGame);
}


async function createGame(event) {

    event.preventDefault();

    const errorBox = document.getElementById("form-error");

    errorBox.innerHTML = "";

    const game = {
        title: document.getElementById("title").value,
        genre: document.getElementById("genre").value,
        platform: document.getElementById("platform").value,
        release_year: document.getElementById("release_year").value,
        developer: document.getElementById("developer").value,
        rating: document.getElementById("rating").value
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(game)
        });

        const data = await response.json();

        // Handle Flask's 400 validation message
        if (response.status === 400) {

            errorBox.innerHTML = `
                <div class="error">
                    ${escapeHTML(data.Error || data.error)}
                </div>
            `;

            return;
        }

        if (!response.ok) {
            throw new Error(
                data.Error ||
                data.error ||
                "Failed to create game"
            );
        }

        // Successfully created
        viewGame(data.id);

    } catch (error) {

        console.error("Create game error:", error);

        errorBox.innerHTML = `
            <div class="error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}


async function showEditForm(id) {

    resultsPage.innerHTML = `
        <p class="loading">Loading game...</p>
    `;

    try {

        const response = await fetch(`${API_URL}/${id}`);

        const data = await response.json();

        if (response.status === 404) {

            resultsPage.innerHTML = `
                <div class="error">

                    <h2>Game Not Found</h2>

                    <p>
                        This game no longer exists.
                    </p>

                    <button onclick="loadGames()">
                        Back to Games
                    </button>

                </div>
            `;

            return;
        }

        if (!response.ok) {
            throw new Error(
                data.Error ||
                data.error ||
                "Could not load game"
            );
        }

        resultsPage.innerHTML = `

            <div class="form-container">

                <h1>Edit Game</h1>

                <div id="form-error"></div>

                <form id="edit-game-form">

                    <label>
                        Title
                        <input
                            type="text"
                            id="title"
                            value="${escapeAttribute(data.title)}"
                            required
                        >
                    </label>

                    <label>
                        Genre
                        <input
                            type="text"
                            id="genre"
                            value="${escapeAttribute(data.genre)}"
                            required
                        >
                    </label>

                    <label>
                        Platform
                        <input
                            type="text"
                            id="platform"
                            value="${escapeAttribute(data.platform)}"
                            required
                        >
                    </label>

                    <label>
                        Release Year
                        <input
                            type="number"
                            id="release_year"
                            value="${data.release_year}"
                            required
                        >
                    </label>

                    <label>
                        Developer
                        <input
                            type="text"
                            id="developer"
                            value="${escapeAttribute(data.developer)}"
                            required
                        >
                    </label>

                    <label>
                        Rating
                        <input
                            type="number"
                            id="rating"
                            value="${data.rating}"
                            step="0.1"
                            min="0"
                            max="10"
                            required
                        >
                    </label>

                    <div class="form-actions">

                        <button type="submit">
                            Save Changes
                        </button>

                        <button
                            type="button"
                            onclick="viewGame(${id})">
                            Cancel
                        </button>

                    </div>

                </form>

            </div>
        `;

        document
            .getElementById("edit-game-form")
            .addEventListener(
                "submit",
                event => updateGame(event, id)
            );

    } catch (error) {

        console.error("Edit form error:", error);

        resultsPage.innerHTML = `
            <div class="error">
                <p>${escapeHTML(error.message)}</p>
                <button onclick="loadGames()">
                    Back to Games
                </button>
            </div>
        `;
    }
}


async function updateGame(event, id) {

    event.preventDefault();

    const errorBox =
        document.getElementById("form-error");

    errorBox.innerHTML = "";

    const game = {
        title: document.getElementById("title").value,
        genre: document.getElementById("genre").value,
        platform: document.getElementById("platform").value,
        release_year:
            document.getElementById("release_year").value,
        developer:
            document.getElementById("developer").value,
        rating:
            document.getElementById("rating").value
    };

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(game)
            }
        );

        const data = await response.json();

        // API validation error
        if (response.status === 400) {

            errorBox.innerHTML = `
                <div class="error">
                    ${escapeHTML(
                        data.error ||
                        data.Error ||
                        "Invalid request"
                    )}
                </div>
            `;

            return;
        }

        // Game was deleted before update
        if (response.status === 404) {

            resultsPage.innerHTML = `
                <div class="error">

                    <h2>Game Not Found</h2>

                    <p>
                        This game no longer exists.
                    </p>

                    <button onclick="loadGames()">
                        Back to Games
                    </button>

                </div>
            `;

            return;
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.Error ||
                "Failed to update game"
            );
        }

        viewGame(data.id);

    } catch (error) {

        console.error("Update game error:", error);

        errorBox.innerHTML = `
            <div class="error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

async function deleteGame(id) {

    const confirmed = confirm("Are you sure you want to delete this game?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        // Handle 404
        if (response.status === 404) {

            resultsPage.innerHTML = `
                <div class="error">

                    <h2>Game Not Found</h2>

                    <p>
                        The game may have already been deleted.
                    </p>

                    <button onclick="loadGames()">
                        Back to Games
                    </button>

                </div>
            `;

            return;
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.Error ||
                "Failed to delete game"
            );
        }

        // Refresh list after deletion
        loadGames();

    } catch (error) {

        console.error("Delete game error:", error);

        resultsPage.innerHTML = `
            <div class="error">

                <h2>Could not delete game</h2>

                <p>${escapeHTML(error.message)}</p>

                <button onclick="loadGames()">
                    Back to Games
                </button>

            </div>
        `;
    }
}

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHTML(value);
}
// -----------------------------
window.loadGames = loadGames;
window.viewGame = viewGame;
window.showAddForm = showAddForm;
window.createGame = createGame;
window.showEditForm = showEditForm;
window.updateGame = updateGame;
window.deleteGame = deleteGame;

loadGames();
