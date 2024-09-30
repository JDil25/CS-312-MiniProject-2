import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public')); 

// Route for the root URL
app.get('/', (req, res) => {
    res.render('index'); 
});

// Route to fetch weather forecast data
app.get('/check-weather', async (req, res) => {
    const city = req.query.location; // User will provide the city name
    const apiKey = 'c2e9cc0ef4bb6388b7428fd4e6f776d5'; // API key from OpenWeather

    // Check if the city is provided
    if (!city) {
        return res.render('error', { message: 'Please enter a city:.' });
    }

    try {
        // Get the 5-day weather forecast for the specified city
        const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);

        // Extract tomorrow's forecast from the API response
        const forecastData = forecastResponse.data.list;

        // Determine tomorrow's date
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1); // Get tomorrow's date

        const nextDayForecast = forecastData.filter(forecast => {
            const forecastDateTime = new Date(forecast.dt_txt);
            return forecastDateTime.getDate() === nextDay.getDate();
        });

        // Check tomorrow's forecast for rain
        const willRainTomorrow = nextDayForecast.some(forecast => forecast.weather[0].main.toLowerCase() === 'rain');

        // Render the result in the forecast EJS template
        res.render('forecast', { location: city, willRainTomorrow });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Failed to retrieve weather data. Please try again.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});