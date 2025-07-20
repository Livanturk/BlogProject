import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const app = initializeApp(window.firebaseConfig);
const db = getFirestore(app);

async function fetchPosts() {
    const blogContainer = document.getElementById("blogContainer");
    blogContainer.innerHTML = "<p>Yükleniyor...</p>";

    try {
        const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        blogContainer.innerHTML = ""; // temizle

        snapshot.forEach((doc) => {
            const post = doc.data();

            const card = document.createElement("div");
            card.className = "col";

            card.innerHTML = `
                <div class="card blog-card h-100">
                    <img src="${post.imageUrl}" class="card-img-top" alt="${post.title}">
                    <div class="card-body">
                        <h5 class="card-title">${post.title}</h5>
                        <span class="badge bg-success">${kategoriEtiketi(post.category)}</span>
                        <p class="card-text">${post.description}</p>
                        <a href="post.html?id=${doc.id}" class="btn btn-outline-success">Devamını Oku</a>
                    </div>
                </div>
            `;

            blogContainer.appendChild(card);
        });

        if (snapshot.empty) {
            blogContainer.innerHTML = "<p>Henüz hiç yazı eklenmemiş.</p>";
        }
    } catch (err) {
        blogContainer.innerHTML = "<p>Veriler yüklenemedi.</p>";
        console.error(err);
    }
}

function kategoriEtiketi(cat) {
    switch (cat) {
        case "travel": return "Seyahat";
        case "law": return "Hukuk";
        case "business": return "Girişimcilik";
        case "life": return "Gündelik";
        default: return "Genel";
    }
}

fetchPosts();
