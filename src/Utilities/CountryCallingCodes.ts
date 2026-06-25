export interface CountryCallingCode {
  name: string;
  isoCode: string; // Added: ISO 3166-1 alpha-2 country code (e.g., "US", "IN")
  callingCode: string; // Will ensure this includes the '+' prefix
}

export const countryCallingCodes: CountryCallingCode[] = [
  { name: "Afghanistan", isoCode: "AF", callingCode: "93" },
  { name: "Albania", isoCode: "AL", callingCode: "355" },
  { name: "Algeria", isoCode: "DZ", callingCode: "213" },
  { name: "Andorra", isoCode: "AD", callingCode: "376" },
  { name: "Angola", isoCode: "AO", callingCode: "244" },
  { name: "Antigua and Barbuda", isoCode: "AG", callingCode: "1" }, // 1 (268)
  { name: "Argentina", isoCode: "AR", callingCode: "54" },
  { name: "Armenia", isoCode: "AM", callingCode: "374" },
  { name: "Australia", isoCode: "AU", callingCode: "61" },
  { name: "Austria", isoCode: "AT", callingCode: "43" },
  { name: "Azerbaijan", isoCode: "AZ", callingCode: "994" },
  { name: "Bahamas", isoCode: "BS", callingCode: "1" }, // 1 (242)
  { name: "Bahrain", isoCode: "BH", callingCode: "973" },
  { name: "Bangladesh", isoCode: "BD", callingCode: "880" },
  { name: "Barbados", isoCode: "BB", callingCode: "1" }, // 1 (246)
  { name: "Belarus", isoCode: "BY", callingCode: "375" },
  { name: "Belgium", isoCode: "BE", callingCode: "32" },
  { name: "Belize", isoCode: "BZ", callingCode: "501" },
  { name: "Benin", isoCode: "BJ", callingCode: "229" },
  { name: "Bhutan", isoCode: "BT", callingCode: "975" },
  { name: "Bolivia", isoCode: "BO", callingCode: "591" },
  { name: "Bosnia and Herzegovina", isoCode: "BA", callingCode: "387" },
  { name: "Botswana", isoCode: "BW", callingCode: "267" },
  { name: "Brazil", isoCode: "BR", callingCode: "55" },
  { name: "Brunei", isoCode: "BN", callingCode: "673" },
  { name: "Bulgaria", isoCode: "BG", callingCode: "359" },
  { name: "Burkina Faso", isoCode: "BF", callingCode: "226" },
  { name: "Burundi", isoCode: "BI", callingCode: "257" },
  { name: "Cabo Verde", isoCode: "CV", callingCode: "238" },
  { name: "Cambodia", isoCode: "KH", callingCode: "855" },
  { name: "Cameroon", isoCode: "CM", callingCode: "237" },
  { name: "Canada", isoCode: "CA", callingCode: "1" },
  { name: "Central African Republic", isoCode: "CF", callingCode: "236" },
  { name: "Chad", isoCode: "TD", callingCode: "235" },
  { name: "Chile", isoCode: "CL", callingCode: "56" },
  { name: "China", isoCode: "CN", callingCode: "86" },
  { name: "Colombia", isoCode: "CO", callingCode: "57" },
  { name: "Comoros", isoCode: "KM", callingCode: "269" },
  { name: "Congo (Brazzaville)", isoCode: "CG", callingCode: "242" },
  { name: "Congo (Kinshasa)", isoCode: "CD", callingCode: "243" },
  { name: "Costa Rica", isoCode: "CR", callingCode: "506" },
  { name: "Côte d'Ivoire", isoCode: "CI", callingCode: "225" },
  { name: "Croatia", isoCode: "HR", callingCode: "385" },
  { name: "Cuba", isoCode: "CU", callingCode: "53" },
  { name: "Cyprus", isoCode: "CY", callingCode: "357" },
  { name: "Czech Republic", isoCode: "CZ", callingCode: "420" },
  { name: "Denmark", isoCode: "DK", callingCode: "45" },
  { name: "Djibouti", isoCode: "DJ", callingCode: "253" },
  { name: "Dominica", isoCode: "DM", callingCode: "1" }, // 1 (767)
  { name: "Dominican Republic", isoCode: "DO", callingCode: "1" }, // 1 (809), 1 (829), 1 (849)
  { name: "East Timor", isoCode: "TL", callingCode: "670" },
  { name: "Ecuador", isoCode: "EC", callingCode: "593" },
  { name: "Egypt", isoCode: "EG", callingCode: "20" },
  { name: "El Salvador", isoCode: "SV", callingCode: "503" },
  { name: "Equatorial Guinea", isoCode: "GQ", callingCode: "240" },
  { name: "Eritrea", isoCode: "ER", callingCode: "291" },
  { name: "Estonia", isoCode: "EE", callingCode: "372" },
  { name: "Eswatini", isoCode: "SZ", callingCode: "268" },
  { name: "Ethiopia", isoCode: "ET", callingCode: "251" },
  { name: "Fiji", isoCode: "FJ", callingCode: "679" },
  { name: "Finland", isoCode: "FI", callingCode: "358" },
  { name: "France", isoCode: "FR", callingCode: "33" },
  { name: "Gabon", isoCode: "GA", callingCode: "241" },
  { name: "Gambia", isoCode: "GM", callingCode: "220" },
  { name: "Georgia", isoCode: "GE", callingCode: "995" },
  { name: "Germany", isoCode: "DE", callingCode: "49" },
  { name: "Ghana", isoCode: "GH", callingCode: "233" },
  { name: "Greece", isoCode: "GR", callingCode: "30" },
  { name: "Grenada", isoCode: "GD", callingCode: "1" }, // 1 (473)
  { name: "Guatemala", isoCode: "GT", callingCode: "502" },
  { name: "Guinea", isoCode: "GN", callingCode: "224" },
  { name: "Guinea-Bissau", isoCode: "GW", callingCode: "245" },
  { name: "Guyana", isoCode: "GY", callingCode: "592" },
  { name: "Haiti", isoCode: "HT", callingCode: "509" },
  { name: "Honduras", isoCode: "HN", callingCode: "504" },
  { name: "Hungary", isoCode: "HU", callingCode: "36" },
  { name: "Iceland", isoCode: "IS", callingCode: "354" },
  { name: "India", isoCode: "IN", callingCode: "91" },
  { name: "Indonesia", isoCode: "ID", callingCode: "62" },
  { name: "Iran", isoCode: "IR", callingCode: "98" },
  { name: "Iraq", isoCode: "IQ", callingCode: "964" },
  { name: "Ireland", isoCode: "IE", callingCode: "353" },
  { name: "Israel", isoCode: "IL", callingCode: "972" },
  { name: "Italy", isoCode: "IT", callingCode: "39" },
  { name: "Jamaica", isoCode: "JM", callingCode: "1" }, // 1 (876)
  { name: "Japan", isoCode: "JP", callingCode: "81" },
  { name: "Jordan", isoCode: "JO", callingCode: "962" },
  { name: "Kazakhstan", isoCode: "KZ", callingCode: "7" }, // 7 (6xx), 7 (7xx)
  { name: "Kenya", isoCode: "KE", callingCode: "254" },
  { name: "Kiribati", isoCode: "KI", callingCode: "686" },
  { name: "North Korea", isoCode: "KP", callingCode: "850" },
  { name: "South Korea", isoCode: "KR", callingCode: "82" },
  { name: "Kuwait", isoCode: "KW", callingCode: "965" },
  { name: "Kyrgyzstan", isoCode: "KG", callingCode: "996" },
  { name: "Laos", isoCode: "LA", callingCode: "856" },
  { name: "Latvia", isoCode: "LV", callingCode: "371" },
  { name: "Lebanon", isoCode: "LB", callingCode: "961" },
  { name: "Lesotho", isoCode: "LS", callingCode: "266" },
  { name: "Liberia", isoCode: "LR", callingCode: "231" },
  { name: "Libya", isoCode: "LY", callingCode: "218" },
  { name: "Liechtenstein", isoCode: "LI", callingCode: "423" },
  { name: "Lithuania", isoCode: "LT", callingCode: "370" },
  { name: "Luxembourg", isoCode: "LU", callingCode: "352" },
  { name: "Madagascar", isoCode: "MG", callingCode: "261" },
  { name: "Malawi", isoCode: "MW", callingCode: "265" },
  { name: "Malaysia", isoCode: "MY", callingCode: "60" },
  { name: "Maldives", isoCode: "MV", callingCode: "960" },
  { name: "Mali", isoCode: "ML", callingCode: "223" },
  { name: "Malta", isoCode: "MT", callingCode: "356" },
  { name: "Marshall Islands", isoCode: "MH", callingCode: "692" },
  { name: "Mauritania", isoCode: "MR", callingCode: "222" },
  { name: "Mauritius", isoCode: "MU", callingCode: "230" },
  { name: "Mexico", isoCode: "MX", callingCode: "52" },
  { name: "Micronesia", isoCode: "FM", callingCode: "691" },
  { name: "Moldova", isoCode: "MD", callingCode: "373" },
  { name: "Monaco", isoCode: "MC", callingCode: "377" },
  { name: "Mongolia", isoCode: "MN", callingCode: "976" },
  { name: "Montenegro", isoCode: "ME", callingCode: "382" },
  { name: "Morocco", isoCode: "MA", callingCode: "212" },
  { name: "Mozambique", isoCode: "MZ", callingCode: "258" },
  { name: "Myanmar", isoCode: "MM", callingCode: "95" },
  { name: "Namibia", isoCode: "NA", callingCode: "264" },
  { name: "Nauru", isoCode: "NR", callingCode: "674" },
  { name: "Nepal", isoCode: "NP", callingCode: "977" },
  { name: "Netherlands", isoCode: "NL", callingCode: "31" },
  { name: "New Zealand", isoCode: "NZ", callingCode: "64" },
  { name: "Nicaragua", isoCode: "NI", callingCode: "505" },
  { name: "Niger", isoCode: "NE", callingCode: "227" },
  { name: "Nigeria", isoCode: "NG", callingCode: "234" },
  { name: "North Macedonia", isoCode: "MK", callingCode: "389" },
  { name: "Norway", isoCode: "NO", callingCode: "47" },
  { name: "Oman", isoCode: "OM", callingCode: "968" },
  { name: "Pakistan", isoCode: "PK", callingCode: "92" },
  { name: "Palau", isoCode: "PW", callingCode: "680" },
  { name: "Palestine", isoCode: "PS", callingCode: "970" }, // For Palestinian Territories
  { name: "Panama", isoCode: "PA", callingCode: "507" },
  { name: "Papua New Guinea", isoCode: "PG", callingCode: "675" },
  { name: "Paraguay", isoCode: "PY", callingCode: "595" },
  { name: "Peru", isoCode: "PE", callingCode: "51" },
  { name: "Philippines", isoCode: "PH", callingCode: "63" },
  { name: "Poland", isoCode: "PL", callingCode: "48" },
  { name: "Portugal", isoCode: "PT", callingCode: "351" },
  { name: "Qatar", isoCode: "QA", callingCode: "974" },
  { name: "Romania", isoCode: "RO", callingCode: "40" },
  { name: "Russia", isoCode: "RU", callingCode: "7" },
  { name: "Rwanda", isoCode: "RW", callingCode: "250" },
  { name: "Saint Kitts and Nevis", isoCode: "KN", callingCode: "1" }, // 1 (869)
  { name: "Saint Lucia", isoCode: "LC", callingCode: "1" }, // 1 (758)
  {
    name: "Saint Vincent and the Grenadines",
    isoCode: "VC",
    callingCode: "1",
  }, // 1 (784)
  { name: "Samoa", isoCode: "WS", callingCode: "685" },
  { name: "San Marino", isoCode: "SM", callingCode: "378" },
  { name: "Sao Tome and Principe", isoCode: "ST", callingCode: "239" },
  { name: "Saudi Arabia", isoCode: "SA", callingCode: "966" },
  { name: "Senegal", isoCode: "SN", callingCode: "221" },
  { name: "Serbia", isoCode: "RS", callingCode: "381" },
  { name: "Seychelles", isoCode: "SC", callingCode: "248" },
  { name: "Sierra Leone", isoCode: "SL", callingCode: "232" },
  { name: "Singapore", isoCode: "SG", callingCode: "65" },
  { name: "Slovakia", isoCode: "SK", callingCode: "421" },
  { name: "Slovenia", isoCode: "SI", callingCode: "386" },
  { name: "Solomon Islands", isoCode: "SB", callingCode: "677" },
  { name: "Somalia", isoCode: "SO", callingCode: "252" },
  { name: "South Africa", isoCode: "ZA", callingCode: "27" },
  { name: "South Sudan", isoCode: "SS", callingCode: "211" },
  { name: "Spain", isoCode: "ES", callingCode: "34" },
  { name: "Sri Lanka", isoCode: "LK", callingCode: "94" },
  { name: "Sudan", isoCode: "SD", callingCode: "249" },
  { name: "Suriname", isoCode: "SR", callingCode: "597" },
  { name: "Sweden", isoCode: "SE", callingCode: "46" },
  { name: "Switzerland", isoCode: "CH", callingCode: "41" },
  { name: "Syria", isoCode: "SY", callingCode: "963" },
  { name: "Taiwan", isoCode: "TW", callingCode: "886" },
  { name: "Tajikistan", isoCode: "TJ", callingCode: "992" },
  { name: "Tanzania", isoCode: "TZ", callingCode: "255" },
  { name: "Thailand", isoCode: "TH", callingCode: "66" },
  { name: "Togo", isoCode: "TG", callingCode: "228" },
  { name: "Tonga", isoCode: "TO", callingCode: "676" },
  { name: "Trinidad and Tobago", isoCode: "TT", callingCode: "1" }, // 1 (868)
  { name: "Tunisia", isoCode: "TN", callingCode: "216" },
  { name: "Turkey", isoCode: "TR", callingCode: "90" },
  { name: "Turkmenistan", isoCode: "TM", callingCode: "993" },
  { name: "Tuvalu", isoCode: "TV", callingCode: "688" },
  { name: "Uganda", isoCode: "UG", callingCode: "256" },
  { name: "Ukraine", isoCode: "UA", callingCode: "380" },
  { name: "United Arab Emirates", isoCode: "AE", callingCode: "971" },
  { name: "United Kingdom", isoCode: "GB", callingCode: "44" },
  { name: "United States", isoCode: "US", callingCode: "1" },
  { name: "Uruguay", isoCode: "UY", callingCode: "598" },
  { name: "Uzbekistan", isoCode: "UZ", callingCode: "998" },
  { name: "Vanuatu", isoCode: "VU", callingCode: "678" },
  { name: "Vatican City", isoCode: "VA", callingCode: "379" }, // or 39
  { name: "Venezuela", isoCode: "VE", callingCode: "58" },
  { name: "Vietnam", isoCode: "VN", callingCode: "84" },
  { name: "Yemen", isoCode: "YE", callingCode: "967" },
  { name: "Zambia", isoCode: "ZM", callingCode: "260" },
  { name: "Zimbabwe", isoCode: "ZW", callingCode: "263" },
];

/**
 * Gets the international calling code for a given country name.
 * The search is case-insensitive.
 * @param countryName The name of the country (e.g., "Canada", "india").
 * @returns The calling code (e.g., "+1", "+91") or undefined if not found.
 */

export const getCallingCodeByCountry = (
  countryName: string = "Albania" // Default value if no argument is passed or argument is undefined
): string | undefined => {
  if (countryName.length === 0) {
    countryName = "Albania"; // Corrected: Use assignment operator '=' not comparison '==='
  }

  const lowerCaseCountryName = countryName.toLowerCase();
  const foundCountry = countryCallingCodes.find(
    (country) => country.name.toLowerCase() === lowerCaseCountryName
  );

  return foundCountry?.callingCode;
};

/**
 * Gets the CountryCallingCode object for a given country ISO 2-letter code.
 * The search is case-insensitive.
 * @param isoCode The ISO 3166-1 alpha-2 code of the country (e.g., "US", "IN").
 * @returns The CountryCallingCode object or undefined if not found.
 */
export const getIsoCodeByCountryName = (
  countryName: string
): string | undefined => {
  if (!countryName || countryName.length === 0) {
    countryName = "Albania";
  }
  const lowerCaseCountryName = countryName.toLowerCase();
  const foundCountry = countryCallingCodes.find(
    (country) => country.name.toLowerCase() === lowerCaseCountryName
  );
  // Return only the isoCode from the found country object
  return foundCountry?.isoCode;
};

/**
 * Gets the CountryCallingCode object for a given international calling code.
 * @param callingCode The international calling code (e.g., "91", "1").
 * @returns The CountryCallingCode object or undefined if not found.
 */

export const getCountryByCallingCode = (
  callingCode: string
): CountryCallingCode | undefined => {
  if (!callingCode) {
    return undefined;
  }
  return countryCallingCodes.find(
    (country) => country.callingCode === callingCode
  );
};
