/* ==========================================
   SPORTRACK - LOCAL STORAGE MOTORU (HATA TAMİRLİ & KİLİTSİZ)
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // GLOBAL: PROFİL FOTOĞRAFI HAFIZA KONTROLÜ
    // ==========================================
    const savedAvatar = localStorage.getItem("userAvatar") || "image_9228c4.jpg";
    
    const smallAvatars = document.querySelectorAll(".user-avatar-small");
    if (smallAvatars.length > 0) {
        smallAvatars.forEach(img => {
            img.src = savedAvatar;
        });
    }

    const avatarUpload = document.getElementById("avatarUpload");
    const removeAvatarBtn = document.getElementById("removeAvatarBtn");
    const profilePreview = document.getElementById("profilePreview");

    if (profilePreview) {
        profilePreview.src = savedAvatar;
    }

    if (avatarUpload) {
        avatarUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    localStorage.setItem("userAvatar", base64Image);
                    if (profilePreview) profilePreview.src = base64Image;
                    
                    const liveAvatars = document.querySelectorAll(".user-avatar-small");
                    if (liveAvatars.length > 0) {
                        liveAvatars.forEach(img => img.src = base64Image);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener("click", () => {
            localStorage.removeItem("userAvatar");
            if (profilePreview) profilePreview.src = "image_9228c4.jpg";
            
            const liveAvatars = document.querySelectorAll(".user-avatar-small");
            if (liveAvatars.length > 0) {
                liveAvatars.forEach(img => img.src = "image_9228c4.jpg");
            }
            alert("Profil fotoğrafı kaldırıldı, varsayılana dönüldü.");
        });
    }


    // ==========================================
    // 1. GRAFİK VE KİLO TAKİP SİSTEMİ (SINIRLAMASIZ)
    // ==========================================
    const weightInput = document.getElementById("weightInput");
    const addWeightBtn = document.getElementById("addWeightBtn");
    const editWeightBtn = document.getElementById("editWeightBtn");
    const ctx = document.getElementById("kiloChart");

    let weightHistory = [];
    let kiloChart = null;

    try {
        const localData = localStorage.getItem("weightHistory");
        if (localData && localData.trim() !== "") {
            weightHistory = JSON.parse(localData);
        }
    } catch (error) {
        console.error("Kilo verisi bozuk bulundu, sıfırlanıyor...", error);
        localStorage.setItem("weightHistory", JSON.stringify([]));
        weightHistory = [];
    }

    if (ctx) {
        kiloChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weightHistory.map((_, index) => `${index + 1}. Kayıt`),
                datasets: [{
                    label: 'Kilo İlerlemesi (kg)',
                    data: weightHistory,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
        checkEditOption();
    }

    if (addWeightBtn && weightInput) {
        addWeightBtn.addEventListener("click", () => {
            const weightVal = parseFloat(weightInput.value);
            if (!weightVal || weightVal <= 0) {
                alert("Lütfen geçerli bir kilo değeri girin!");
                return;
            }

            // CRITICAL: 30 günlük bekleme kilidi tamamen kaldırıldı! 🚀
            weightHistory.push(weightVal);
            localStorage.setItem("weightHistory", JSON.stringify(weightHistory));

            updateChart();
            weightInput.value = "";
            checkEditOption();
            alert("Kilo kaydınız başarıyla eklendi!");
        });
    }

    if (editWeightBtn && weightInput) {
        editWeightBtn.addEventListener("click", () => {
            const weightVal = parseFloat(weightInput.value);
            if (!weightVal || weightVal <= 0) {
                alert("Düzeltme yapmak için lütfen yeni kilo değerini kutuya yazın!");
                return;
            }

            if (weightHistory.length > 0) {
                weightHistory[weightHistory.length - 1] = weightVal;
                localStorage.setItem("weightHistory", JSON.stringify(weightHistory));
                updateChart();
                weightInput.value = "";
                alert("Son girdiğiniz veri başarıyla düzeltildi! 🛠️");
            }
        });
    }

    function updateChart() {
        if (kiloChart) {
            kiloChart.data.labels = weightHistory.map((_, index) => `${index + 1}. Kayıt`);
            kiloChart.data.datasets[0].data = weightHistory;
            kiloChart.update();
        }
    }

    function checkEditOption() {
        if (editWeightBtn) {
            if (weightHistory.length > 0) {
                editWeightBtn.style.display = "inline-block";
            } else {
                editWeightBtn.style.display = "none";
            }
        }
    }

    // ==========================================
    // 2. DETAYLI KALORİ & MAKRO HESAPLAMA
    // ==========================================
    const calcBtn = document.getElementById("calcBtn");
    const calcResults = document.getElementById("calcResults");

    if (calcBtn) {
        calcBtn.addEventListener("click", () => {
            const age = parseInt(document.getElementById("age").value);
            const height = parseInt(document.getElementById("height").value);
            const weight = parseInt(document.getElementById("weight").value);
            const gender = document.getElementById("gender").value;
            const activity = parseFloat(document.getElementById("activity").value);
            const goal = document.getElementById("goal").value;

            if (!age || !height || !weight) {
                alert("Lütfen tüm alanları eksiksiz doldurun!");
                return;
            }

            let bmh = 0;
            if (gender === "erkek") {
                bmh = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
            } else {
                bmh = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            }

            let tdee = bmh * activity;
            let targetKalori = tdee;

            if (goal === "lose") targetKalori -= 500;
            if (goal === "gain") targetKalori += 400;

            const protein = Math.round((targetKalori * 0.30) / 4);
            const karbonhidrat = Math.round((targetKalori * 0.45) / 4);
            const yag = Math.round((targetKalori * 0.25) / 9);

            if (calcResults) {
                calcResults.style.display = "block";
                calcResults.innerHTML = `
                    <h3 style="color: #ef4444; margin-bottom: 12px;">📊 Hesaplama Sonuçlarınız:</h3>
                    <p><strong>Bazal Metabolizma Hızınız (BMH):</strong> ${Math.round(bmh)} kcal</p>
                    <p><strong>Günlük Hedef Kaloriniz:</strong> <span style="color:#4ade80; font-weight:bold;">${Math.round(targetKalori)} kcal</span></p>
                    <hr style="border-color:#334155; margin:10px 0;">
                    <p style="font-weight:600; margin-bottom:5px;">🎯 Önerilen Günlük Makrolar:</p>
                    <ul style="list-style:none; padding-left:10px;">
                        <li>🥩 <strong>Protein:</strong> ${protein}g</li>
                        <li>🍞 <strong>Karbonhidrat:</strong> ${karbonhidrat}g</li>
                        <li>🥑 <strong>Sağlıklı Yağ:</strong> ${yag}g</li>
                    </ul>
                `;
            }
        });
    }

    // ==========================================
    // 3. KALICI BLOG / TOPLULUK MESAJ SİSTEMİ
    // ==========================================
    const postInput = document.getElementById("postInput");
    const sendPostBtn = document.getElementById("sendPostBtn");
    const postsContainer = document.getElementById("postsContainer");

    let savedPosts = [];

    try {
        const localPosts = localStorage.getItem("communityPosts");
        if (localPosts && localPosts.trim() !== "") {
            savedPosts = JSON.parse(localPosts);
        }
    } catch (error) {
        console.error("Topluluk verisi bozuk bulundu, sıfırlanıyor...", error);
        localStorage.setItem("communityPosts", JSON.stringify([]));
        savedPosts = [];
    }

    function renderPosts() {
        if (!postsContainer) return;
        postsContainer.innerHTML = "";
        
        savedPosts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.className = "post-card";
            postDiv.innerHTML = `
                <div class="post-user-info">
                    <img src="${post.avatar}" alt="Profil" class="user-avatar-small">
                    <div>
                        <span class="username">${post.username}</span>
                        <span class="badge-role badge-kurucu">KURUCU</span>
                        <p class="post-date">${post.date}</p>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.text}</p>
                </div>
            `;
            postsContainer.appendChild(postDiv);
        });
    }

    if (postsContainer) {
        renderPosts();
    }

    if (sendPostBtn && postsContainer && postInput) {
        sendPostBtn.addEventListener("click", () => {
            const text = postInput.value.trim();
            if (text === "") {
                alert("Boş mesaj gönderilemez!");
                return;
            }

            const now = new Date();
            const dateString = `${now.getDate()}.${now.getMonth()+1}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            const newPostObj = {
                username: "@onur_yener",
                avatar: localStorage.getItem("userAvatar") || "image_9228c4.jpg",
                date: dateString,
                text: text
            };

            savedPosts.unshift(newPostObj);
            localStorage.setItem("communityPosts", JSON.stringify(savedPosts));

            renderPosts();
            postInput.value = "";
        });
    }

    // ==========================================
    // 4. YÖNETİM PANELİ (ADMIN ACTIONS)
    // ==========================================
    const targetUsername = document.getElementById("targetUsername");
    const makeAdminBtn = document.getElementById("makeAdminBtn");
    const removeAdminBtn = document.getElementById("removeAdminBtn");
    const tempBanBtn = document.getElementById("tempBanBtn");
    const permBanBtn = document.getElementById("permBanBtn");

    if (targetUsername) {
        const checkUser = () => {
            const user = targetUsername.value.trim();
            if (!user) {
                alert("Lütfen önce bir kullanıcı adı girin!");
                return false;
            }
            return user;
        };

        if (makeAdminBtn) {
            makeAdminBtn.addEventListener("click", () => {
                const user = checkUser();
                if (user) alert(`${user} başarıyla ADMIN rolüne yükseltildi. 🟢`);
            });
        }
        if (removeAdminBtn) {
            removeAdminBtn.addEventListener("click", () => {
                const user = checkUser();
                if (user) alert(`${user} kullanıcısının tüm admin yetkileri geri alındı. ⚪`);
            });
        }
        if (tempBanBtn) {
            tempBanBtn.addEventListener("click", () => {
                const user = checkUser();
                if (user) alert(`${user} kullanıcısı 7 gün süreyle sistemden uzaklaştırıldı. 🟡`);
            });
        }
        if (permBanBtn) {
            permBanBtn.addEventListener("click", () => {
                const user = checkUser();
                if (user) alert(`${user} kullanıcısı KALICI olarak banlandı! 🔴`);
            });
        }
    }
});