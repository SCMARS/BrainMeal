import { useEffect, useState } from "react";

const Profile = () => {
    const [profile, setProfile] = useState({
        avatar: null,
        height: "",
        weight: "",
        sex: "",
        age: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    // Загрузка данных профиля с бэкенда
    useEffect(() => {
        fetch("http://localhost:5000/profile")
            .then((response) => response.json())
            .then((data) => setProfile(data))
            .catch((error) => console.error("Ошибка загрузки:", error));
    }, []);

    // Функция для обновления данных профиля
    const updateProfile = (key, value) => {
        const updatedProfile = { ...profile, [key]: value };
        setProfile(updatedProfile);
    };

    // Функция для обработки загрузки файла (аватар)
    const handleUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfile((prev) => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Функция для отправки обновленных данных на сервер
    const saveProfile = () => {
        setIsSaving(true);

        fetch("http://localhost:5000/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
        })
            .then((response) => response.json())
            .then((data) => {
                setIsSaving(false);
                alert(data.message || "Profile saved successfully!");
            })
            .catch((error) => {
                setIsSaving(false);
                console.error("Ошибка обновления:", error);
                alert("An error occurred while saving the profile.");
            });
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Your Profile</h1>

            <div style={styles.profilePictureSection}>
                {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" style={styles.profilePicture} />
                ) : (
                    <div style={styles.profilePlaceholder}>No Image</div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    style={styles.hiddenInput}
                    id="fileUpload"
                />
                <label htmlFor="fileUpload" style={styles.uploadButton}>Upload</label>
            </div>

            <p style={styles.description}>
                Eat This Much uses RMR (Resting Metabolic Rate) to estimate your calorie budget,
                which uses height, weight, biological sex, and age as inputs.
            </p>

            <div style={styles.formContainer}>
                <div style={styles.formGroup}>
                    <label>Height</label>
                    <input
                        type="number"
                        value={profile.height}
                        onChange={(e) => updateProfile("height", e.target.value)}
                    />
                    <span>cm</span>
                </div>

                <div style={styles.formGroup}>
                    <label>Weight</label>
                    <input
                        type="number"
                        value={profile.weight}
                        onChange={(e) => updateProfile("weight", e.target.value)}
                    />
                    <span>kgs</span>
                </div>

                <div style={styles.formGroup}>
                    <label>Biological sex</label>
                    <div style={styles.radioGroup}>
                        {["Female", "Male", "Other"].map((gender) => (
                            <button
                                key={gender}
                                style={{
                                    ...styles.radioButton,
                                    backgroundColor: profile.sex === gender ? "#ff4500" : "transparent",
                                }}
                                onClick={() => updateProfile("sex", gender)}
                            >
                                {gender}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label>Age</label>
                    <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => updateProfile("age", e.target.value)}
                    />
                    <span>years</span>
                </div>
            </div>

            <button style={styles.saveButton} onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
            </button>
        </div>
    );
};

const styles = {
    container: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#101010",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        position: "relative",
    },
    title: {
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "24px",
        fontWeight: "bold",
    },
    profilePictureSection: {
        position: "absolute",
        top: "25px",
        right: "25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    profilePicture: {
        width: "160px",
        height: "160px",
        borderRadius: "50%",
        objectFit: "cover",
    },
    profilePlaceholder: {
        width: "160px",
        height: "160px",
        backgroundColor: "rgba(0,0,0,0.67)",
        color: "white",
        fontSize: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
    },
    hiddenInput: {
        display: "none",
    },
    uploadButton: {
        marginTop: "10px",
        backgroundColor: "#fd9308",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
    },
    description: {
        fontSize: "16px",
        textAlign: "center",
        maxWidth: "800px",
        marginBottom: "20px",
    },
    formContainer: {
        width: "80%",
        maxWidth: "800px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#282828",
        padding: "15px",
        borderRadius: "5px",
        fontSize: "18px",
    },
    radioGroup: {
        display: "flex",
        gap: "10px",
    },
    radioButton: {
        color: "white",
        border: "2px solid white",
        padding: "5px 15px",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "16px",
    },
    saveButton: {
        position: "absolute",
        bottom: "134px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#ff4500",
        color: "white",
        border: "none",
        padding: "15px 30px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "18px",
    },
};

export default Profile;






