const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
    "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
    "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
    "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)",
    "Congo (Congo-Kinshasa)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czechia (Czech Republic)", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
    "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
    "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
    "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
    "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
    "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
    "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia",
    "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay",
    "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
    "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu",
    "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const generateUsers = (numberOfUsers, from = 1) => {
    const users = [];
    const countriesCount = countries.length;

    for (let i = from; i <= numberOfUsers + from; i++) {
        // Always use the same country in a consistent cycling manner
        const country = countries[i % countriesCount];

        // Ensure age is between 18 and 80
        const age = 18 + (i % 63);

        users.push({
            username: `user${i}`,
            firstName: `FirstName${i}`,
            lastName: `LastName${i}`,
            email: `user${i}@example.com`,
            age: age,
            dateOfBirth: new Date(
                new Date().getFullYear() - age,
                5,
                15
            ).toISOString(),
            isMarried: i % 2 === 0,
            addresses: Array.from({ length: Math.floor(i % 3) + 1 }, (_, index) => ({
                street: `Street ${index + 1} of User ${i}`,
                city: `City ${index + 1}`,
                country: country,
                purchaseDate: new Date(
                    new Date().getFullYear() - Math.floor(i % 5),
                    5,
                    15
                ).toISOString(),
            })),
        });
    }

    return users;
};

const generateRandomUsers = (numberOfUsers) => {
    const users = [];

    for (let i = 1; i <= numberOfUsers; i++) {
        users.push({
            username: `user${i}`,
            firstName: `FirstName${i}`,
            lastName: `LastName${i}`,
            email: `user${i}@example.com`,
            age: Math.floor(Math.random() * 60) + 18, // Random age between 18 and 77
                dateOfBirth: new Date(
                new Date().getFullYear() - (Math.floor(Math.random() * 60) + 18),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
            ).toISOString(),
            isMarried: Math.random() < 0.5,
            addresses: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => ({
            street: `Street ${index + 1} of User ${i}`,
            city: `City ${index + 1}`,
            country: countries[Math.floor(Math.random() * countries.length)],
            purchaseDate: new Date(
                new Date().getFullYear() - Math.floor(Math.random() * 5),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
            ).toISOString(),
        })),
    });
    }

    return users;
};

module.exports = {
    generateUsers,
    generateRandomUsers
};
