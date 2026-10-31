document.addEventListener("DOMContentLoaded", () => {
    const queryInput = document.getElementById("queryInput");
    const searchBtn = document.getElementById("searchBtn");
    const resultOutput = document.getElementById("resultOutput");
    
    const infoModal = document.getElementById("infoModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const closeModal = document.getElementById("closeModal");

    // History Storage Helper
    function getHistory() {
        return JSON.parse(localStorage.getItem("muet_search_history") || "[]");
    }

    function saveToHistory(query) {
        let history = getHistory();
        history = history.filter(q => q.toLowerCase() !== query.toLowerCase());
        history.unshift(query);
        if (history.length > 20) history.pop();
        localStorage.setItem("muet_search_history", JSON.stringify(history));
    }

    // Perform Search
    async function performSearch() {
        const query = queryInput.value.trim();
        if (!query) return;

        // Blur input immediately so cursor stops blinking
        queryInput.blur();

        resultOutput.innerHTML = "Searching prospectus database...";
        saveToHistory(query);

        try {
            const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            resultOutput.innerHTML = data.result || "No details found.";
        } catch (err) {
            resultOutput.innerHTML = "Error connecting to backend server.";
        }
    }

    searchBtn.addEventListener("click", performSearch);
    queryInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") performSearch();
    });

    // Navigation Handlers
    document.getElementById("navNewSearch").addEventListener("click", () => {
        queryInput.value = "";
        resultOutput.innerHTML = "Ask any question above to search the prospectus database.";
        queryInput.focus();
    });

    document.getElementById("navHistory").addEventListener("click", () => {
        modalTitle.innerText = "Search History";
        const history = getHistory();
        if (history.length === 0) {
            modalBody.innerHTML = "<p>No search history found.</p>";
        } else {
            let html = '<ul class="history-list">';
            history.forEach(item => {
                html += `<li class="history-item" onclick="loadHistoryQuery('${item.replace(/'/g, "\\'")}')">${item}</li>`;
            });
            html += '</ul>';
            modalBody.innerHTML = html;
        }
        infoModal.style.display = "flex";
    });

    document.getElementById("navAbout").addEventListener("click", () => {
        modalTitle.innerText = "About MUET Digital Assistant";
        modalBody.innerHTML = `
            <p><strong>MUET Digital Assistant</strong> is an AI-powered prospectus search system for Mehran University of Engineering and Technology, Jamshoro.</p><br>
            <p>It leverages FastAPI, SQLite database indexing, and LLM synthesis to deliver precise information on university admissions, departments, facilities, and regulations.</p>
        `;
        infoModal.style.display = "flex";
    });

    document.getElementById("navContact").addEventListener("click", () => {
        modalTitle.innerText = "Contact Information";
        modalBody.innerHTML = `
            <p><strong>Mehran University of Engineering & Technology</strong></p>
            <p>Jamshoro, 76062, Sindh, Pakistan</p><br>
            <p><strong>Email:</strong> info@admin.muet.edu.pk</p>
            <p><strong>Phone:</strong> +92 (22) 2772250-73</p>
        `;
        infoModal.style.display = "flex";
    });

    closeModal.addEventListener("click", () => infoModal.style.display = "none");
    window.addEventListener("click", (e) => {
        if (e.target === infoModal) infoModal.style.display = "none";
    });

    window.loadHistoryQuery = function(query) {
        queryInput.value = query;
        infoModal.style.display = "none";
        performSearch();
    };
});
