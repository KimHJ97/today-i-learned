const https = require('https');

const [,, countryCode, year] = process.argv;

if (!countryCode || !year) {
  console.error('Usage: node holiday.js <CountryCode> <Year>');
  process.exit(1);
}

if (isNaN(Number(year))) {
    console.error('Year must be a valid number');
    process.exit(1);
}

// 사용 가능한 나라 정보 조회
async function getAvailableCountries() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'date.nager.at',
            path: `/api/v3/AvailableCountries`,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            // 응답 종료시 수행
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(`Error: ${res.statusCode} ${res.statusMessage}`);
                }
            });
        });
        
        req.on('error', (e) => {
            reject(`Problem with request: ${e.message}`);
        });
        
        req.end();
    });
}

// 나라코드 및 년도에 해당하는 공휴일 정보 조회
async function getHolidays(countryCode, year) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'date.nager.at',
            path: `/api/v3/PublicHolidays/${year}/${countryCode}`,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(`Error: ${res.statusCode} ${res.statusMessage}`);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
        });

        req.end();
    });
}

async function isAvailableCountryCode(countryCode) {
    let availableCountries = await getAvailableCountries();
    return availableCountries.find(country => country.countryCode === countryCode) !== undefined;
}

async function printHolidaysByCountry(countryCode, year) {
    if (!await isAvailableCountryCode(countryCode)) {
        console.error('Wrong country code');
        return;
    }

    let holidays = await getHolidays(countryCode, year);
    const holidayMessage = holidays.map(holiday => 
        `${holiday.date} ${holiday.localName} ${holiday.name}`
    ).join('\n');

    console.log(holidayMessage);
}

printHolidaysByCountry(countryCode, year);