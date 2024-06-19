document.addEventListener("DOMContentLoaded", function() {
    function generateRandomFacultyData(numFaculty) {
        const facultyList = [];
        const firstNames = ["Aarav", "Aaradhya", "Aryan", "Diya", "Ishaan", "Kiara", "Rohan", "Tara", "Vivaan", "Zara"];
        const lastNames = ["Patel", "Shah", "Kumar", "Singh", "Mehta", "Joshi", "Sharma", "Gupta", "Pandey", "Verma"];

        for (let i = 1; i <= numFaculty; i++) {
            const id = Math.floor(Math.random() * 1000) + 100;
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            facultyList.push({ id, name });
        }
        return facultyList;
    }

    function getFacultyData() {
        const savedData = localStorage.getItem('facultyData');
        if (savedData) {
            return JSON.parse(savedData);
        } else {
            const data = {
                1: generateRandomFacultyData(10),
                2: generateRandomFacultyData(10),
                3: generateRandomFacultyData(10),
                4: generateRandomFacultyData(10),
                5: generateRandomFacultyData(10),
                6: generateRandomFacultyData(10),
                7: generateRandomFacultyData(10),
                8: generateRandomFacultyData(10),
            };
            localStorage.setItem('facultyData', JSON.stringify(data));
            return data;
        }
    }


    const facultyData = getFacultyData();
    
    function populateFacultyDropdown(semester) {
        const facultyDropdown = document.getElementById("facultyDropdown");
        facultyDropdown.innerHTML = "";

        const facultyList = facultyData[semester];
        if (facultyList) {
            facultyList.forEach(faculty => {
                const option = document.createElement("option");
                option.value = faculty.id;
                option.text = `${faculty.name} (${faculty.id})`;
                facultyDropdown.appendChild(option);
            });
        }
    }

    const semesterDropdown = document.getElementById("semesterDropdown");
    semesterDropdown.addEventListener("change", function() {
        const selectedSemester = this.value;
        populateFacultyDropdown(selectedSemester);
    });

    populateFacultyDropdown(semesterDropdown.value);

    const endpoint = 'http://localhost:3000/submit-form';

    document.getElementById("feedbackForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const formData = new FormData(this);

        const facultyDropdown = document.getElementById("facultyDropdown");
        const selectedIndex = facultyDropdown.selectedIndex;
        const selectedFaculty = facultyData[semesterDropdown.value][selectedIndex];
        
        if (selectedFaculty) {
            const facultyId = selectedFaculty.id;

            const data = {
                semester: semesterDropdown.value,
                faculty_id: facultyId,
                teaching: formData.get("teaching") || '',  
                coursecontent: formData.get("coursecontent") || '', 
                examination: formData.get("examination") || '',  
                labwork: formData.get("labwork") || '', 
                comments: formData.get("comments"),
            };

            try {
                const response = await fetch(endpoint , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.text();
                if (response.ok) {
                    alert('Feedback submitted successfully!');
                } else {
                    alert(`Error: ${result}`);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Error submitting form');
            }
        } else {
            console.error('Selected faculty is not defined');
        }
    });
});

