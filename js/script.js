document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('postForm');
    const categorySelect = document.getElementById('category');
    const locationFields = document.getElementById('locationFields');

    // Kategori değiştiğinde konum alanlarını göster/gizle
    categorySelect.addEventListener('change', function () {
        if (categorySelect.value === 'travel') {
            locationFields.style.display = 'block';
        } else {
            locationFields.style.display = 'none';
        }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const content = document.getElementById('content').value.trim();
        const category = categorySelect.value;
        const photoFile = document.getElementById('photo').files[0];

        const latitude = document.getElementById('latitude')?.value.trim();
        const longitude = document.getElementById('longitude')?.value.trim();

        if (!title || !description || !content || !category) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        if (!photoFile) {
            alert("Lütfen bir fotoğraf seçin.");
            return;
        }

        if (category === "travel" && (!latitude || !longitude)) {
            alert("Seyahat kategorisinde konum (enlem/boylam) zorunludur.");
            return;
        }

        // 🔐 ImgBB API Key
        const imgbbAPIKey = "2d139bff39eded890fbe5f3f8c81af7d";

        const reader = new FileReader();
        reader.onloadend = async function () {
            const base64Image = reader.result.split(',')[1]; // sadece base64 parçası

            const formData = new FormData();
            formData.append('key', imgbbAPIKey);
            formData.append('image', base64Image);

            try {
                const response = await fetch("https://api.imgbb.com/1/upload", {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!data.success) {
                    alert("Fotoğraf yükleme başarısız.");
                    return;
                }

                const imageUrl = data.data.url;

                // Firebase Firestore'a yaz
                const { db, addDoc, collection } = window.firebaseServices;

                const postData = {
                    title,
                    description,
                    content,
                    category,
                    imageUrl,
                    createdAt: new Date()
                };

                if (category === "travel") {
                    postData.latitude = latitude;
                    postData.longitude = longitude;
                }

                await addDoc(collection(db, "blogPosts"), postData);

                alert("Yazı başarıyla eklendi! Anasayfaya yönlendiriliyorsunuz...");
                window.location.href = "index.html";

                locationFields.style.display = 'none';

            } catch (error) {
                console.error("Hata:", error);
                alert("Veri gönderilemedi: " + error.message);
            }
        };

        reader.readAsDataURL(photoFile);
    });
});
