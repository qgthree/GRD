import { defineStore } from 'pinia';

export const useLocationStore = defineStore('locationStore', {
  state: () => ({
    updated: false,
    countries: [
        {
            "name": "Antarctica",
            "ISO3": "ATA",
            "region": "",
            "type": "Indeterminate"
        },
        {
            "name": "South Georgia and the South Sandwich Islands",
            "ISO3": "SGS",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Chile",
            "ISO3": "CHL",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Argentina",
            "ISO3": "ARG",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Australia",
            "ISO3": "AUS",
            "region": "ALAC",
            "type": "Country"
        },
        {
            "name": "Bouvet Island",
            "ISO3": "BVT",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Heard Island and McDonald Islands",
            "ISO3": "HMD",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "New Zealand",
            "ISO3": "NZL",
            "region": "ALAC",
            "type": "Country"
        },
        {
            "name": "Falkland Islands (Islas Malvinas)",
            "ISO3": "FLK",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "French Southern and Antarctic Lands",
            "ISO3": "ATF",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "South Africa",
            "ISO3": "ZAF",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Saint Helena, Ascension, and Tristan da Cunha",
            "ISO3": "SHN",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Uruguay",
            "ISO3": "URY",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Norfolk Island",
            "ISO3": "NFK",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Lesotho",
            "ISO3": "LSO",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Brazil",
            "ISO3": "BRA",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Eswatini",
            "ISO3": "SWZ",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "New Caledonia",
            "ISO3": "NCL",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Tonga",
            "ISO3": "TON",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Reunion",
            "ISO3": "REU",
            "region": "Africa",
            "type": "Overseas department"
        },
        {
            "name": "Fiji",
            "ISO3": "FJI",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Vanuatu",
            "ISO3": "VUT",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Mauritius",
            "ISO3": "MUS",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Paraguay",
            "ISO3": "PRY",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Niue",
            "ISO3": "NIU",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Cook Islands",
            "ISO3": "COK",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Botswana",
            "ISO3": "BWA",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Madagascar",
            "ISO3": "MDG",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Coral Sea Islands",
            "ISO3": "XCS",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Zimbabwe",
            "ISO3": "ZWE",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Mozambique",
            "ISO3": "MOZ",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "American Samoa",
            "ISO3": "ASM",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "Wallis and Futuna",
            "ISO3": "WLF",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Samoa",
            "ISO3": "WSM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Mayotte",
            "ISO3": "MYT",
            "region": "Africa",
            "type": "Disputed"
        },
        {
            "name": "Ashmore and Cartier Islands",
            "ISO3": "XAC",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Comoros",
            "ISO3": "COM",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Cocos (Keeling) Islands",
            "ISO3": "CCK",
            "region": "ALAC",
            "type": "External territory"
        },
        {
            "name": "Malawi",
            "ISO3": "MWI",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Solomon Islands",
            "ISO3": "SLB",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Papua New Guinea",
            "ISO3": "PNG",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Indonesia",
            "ISO3": "IDN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "French Polynesia",
            "ISO3": "PYF",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Christmas Island",
            "ISO3": "CXR",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Seychelles",
            "ISO3": "SYC",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Kiribati",
            "ISO3": "KIR",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Bolivia",
            "ISO3": "BOL",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Tuvalu",
            "ISO3": "TUV",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Tokelau",
            "ISO3": "TKL",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Zambia",
            "ISO3": "ZMB",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "East Timor",
            "ISO3": " TLS",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Tanzania",
            "ISO3": "TZA",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "British Indian Ocean Territory",
            "ISO3": "IOT",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Ecuador",
            "ISO3": "ECU",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Burundi",
            "ISO3": "BDI",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Equatorial Guinea",
            "ISO3": "GNQ",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Rwanda",
            "ISO3": "RWA",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Nauru",
            "ISO3": "NRU",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "Peru",
            "ISO3": "PER",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Sao Tome and Principe",
            "ISO3": "STP",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Singapore",
            "ISO3": "SGP",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Malaysia",
            "ISO3": "MYS",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Gabon",
            "ISO3": "GAB",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Palau",
            "ISO3": "PLW",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Republic of the Congo",
            "ISO3": "COG",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Cameroon",
            "ISO3": "CMR",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Colombia",
            "ISO3": "COL",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Uganda",
            "ISO3": "UGA",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Nigeria",
            "ISO3": "NGA",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Marshall Islands",
            "ISO3": "MHL",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Kenya",
            "ISO3": "KEN",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Brunei",
            "ISO3": "BRN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Philippines",
            "ISO3": "PHL",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Federated States of Micronesia",
            "ISO3": "FSM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Democratic Republic of the Congo",
            "ISO3": "COD",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Maldives",
            "ISO3": "MDV",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "French Guiana",
            "ISO3": "GUF",
            "region": "ALAC",
            "type": "Disputed"
        },
        {
            "name": "Suriname",
            "ISO3": "SUR",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Thailand",
            "ISO3": "THA",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Guyana",
            "ISO3": "GUY",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "India",
            "ISO3": "IND",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Panama",
            "ISO3": "PAN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Sierra Leone",
            "ISO3": "SLE",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Vietnam",
            "ISO3": "VNM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Sri Lanka",
            "ISO3": "LKA",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Venezuela",
            "ISO3": "VEN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Burma",
            "ISO3": "MMR",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Guinea",
            "ISO3": "GIN",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "Africa",
            "type": "Disputed"
        },
        {
            "name": "Clipperton Island",
            "ISO3": "CPT",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Cambodia",
            "ISO3": "KHM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Trinidad and Tobago",
            "ISO3": "TTO",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Central African Republic",
            "ISO3": "CAF",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "Africa",
            "type": "Geo unit"
        },
        {
            "name": "Togo",
            "ISO3": "TGO",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Guinea-Bissau",
            "ISO3": "GNB",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Cote d’Ivoire",
            "ISO3": "CIV",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Spratly Islands",
            "ISO3": "XSP",
            "region": "ALAC",
            "type": "Indeterminate"
        },
        {
            "name": "Nicaragua",
            "ISO3": "NIC",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Yemen",
            "ISO3": "YEM",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Grenada",
            "ISO3": "GRD",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "South Sudan",
            "ISO3": "SSD",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Curaçao",
            "ISO3": "CUW",
            "region": "ALAC",
            "type": "Country"
        },
        {
            "name": "Benin",
            "ISO3": "BEN",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Saint Vincent and the Grenadines",
            "ISO3": "VCT",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Aruba",
            "ISO3": "ABW",
            "region": "ALAC",
            "type": "Country"
        },
        {
            "name": "Somalia",
            "ISO3": "SOM",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Honduras",
            "ISO3": "HND",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Barbados",
            "ISO3": "BRB",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Guam",
            "ISO3": "GUM",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "Senegal",
            "ISO3": "SEN",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Saint Lucia",
            "ISO3": "LCA",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Northern Mariana Islands",
            "ISO3": "MNP",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "Martinique",
            "ISO3": "MTQ",
            "region": "ALAC",
            "type": "Overseas department"
        },
        {
            "name": "Ethiopia",
            "ISO3": "ETH",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Cabo Verde",
            "ISO3": "CPV",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Burkina Faso",
            "ISO3": "BFA",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Dominica",
            "ISO3": "DMA",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Eritrea",
            "ISO3": "ERI",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Guadeloupe",
            "ISO3": "GLP",
            "region": "ALAC",
            "type": "Overseas department"
        },
        {
            "name": "Montserrat",
            "ISO3": "MSR",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Paracel Islands",
            "ISO3": "XPR",
            "region": "ALAC",
            "type": "Geo unit"
        },
        {
            "name": "Saudi Arabia",
            "ISO3": "SAU",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Antigua and Barbuda",
            "ISO3": "ATG",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Saint Kitts and Nevis",
            "ISO3": "KNA",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Belize",
            "ISO3": "BLZ",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Oman",
            "ISO3": "OMN",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Virgin Islands, U.S.",
            "ISO3": "VIR",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "Saint Barthelemy",
            "ISO3": "BLM",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Saint Martin",
            "ISO3": "MAF",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Puerto Rico",
            "ISO3": "PRI",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "Anguilla",
            "ISO3": "AIA",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Mexico",
            "ISO3": "MEX",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Navassa Island",
            "ISO3": "XNV",
            "region": "",
            "type": "Geo unit"
        },
        {
            "name": "British Virgin Islands",
            "ISO3": "VGB",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Jamaica",
            "ISO3": "JAM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Haiti",
            "ISO3": "HTI",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Wake Island",
            "ISO3": "XWK",
            "region": "",
            "type": "Geo unit"
        },
        {
            "name": "Cayman Islands",
            "ISO3": "CYM",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Mauritania",
            "ISO3": "MRT",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Dominican Republic",
            "ISO3": "DOM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "China",
            "ISO3": "CHN",
            "region": "ALAC",
            "type": "Country"
        },
        {
            "name": "United States",
            "ISO3": "USA",
            "region": "",
            "type": "Country"
        },
        {
            "name": "Cuba",
            "ISO3": "CUB",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Taiwan",
            "ISO3": "TWN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Sudan",
            "ISO3": "SDN",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Turks and Caicos Islands",
            "ISO3": "TCA",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Bangladesh",
            "ISO3": "BGD",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Macau",
            "ISO3": "MAC",
            "region": "ALAC",
            "type": "Country"
        },
        {
            "name": "Hong Kong",
            "ISO3": "HKG",
            "region": "ALAC",
            "type": "Country"
        },
        {
            "name": "Laos",
            "ISO3": "LAO",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Chad",
            "ISO3": "TCD",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Niger",
            "ISO3": "NER",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Pakistan",
            "ISO3": "PAK",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "United Arab Emirates",
            "ISO3": "ARE",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Japan",
            "ISO3": "JPN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Qatar",
            "ISO3": "QAT",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Mali",
            "ISO3": "MLI",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Bahrain",
            "ISO3": "BHR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "Egypt",
            "ISO3": "EGY",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "The Bahamas",
            "ISO3": "BHS",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Canary Islands",
            "ISO3": "",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "MENAE",
            "type": "Disputed"
        },
        {
            "name": "Bhutan",
            "ISO3": "BTN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Kuwait",
            "ISO3": "KWT",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Iran",
            "ISO3": "IRN",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Nepal",
            "ISO3": "NPL",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Disputed"
        },
        {
            "name": "Gaza Strip",
            "ISO3": "",
            "region": "MENAE",
            "type": "Disputed"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "MENAE",
            "type": "Disputed"
        },
        {
            "name": "Bermuda",
            "ISO3": "BMU",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "MENAE",
            "type": "Overseas department"
        },
        {
            "name": "West Bank",
            "ISO3": "",
            "region": "MENAE",
            "type": "Disputed"
        },
        {
            "name": "Libya",
            "ISO3": "LBY",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Disputed"
        },
        {
            "name": "Israel",
            "ISO3": "ISR",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Tunisia",
            "ISO3": "TUN",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Lebanon",
            "ISO3": "LBN",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Syria",
            "ISO3": "SYR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Greece",
            "ISO3": "GRC",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Cyprus",
            "ISO3": "CYP",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "South Korea",
            "ISO3": "KOR",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "Morocco",
            "ISO3": "MAR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Spain",
            "ISO3": "ESP",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Disputed"
        },
        {
            "name": "Malta",
            "ISO3": "MLT",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Italy",
            "ISO3": "ITA",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Geo unit"
        },
        {
            "name": "Algeria",
            "ISO3": "DZA",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Iraq",
            "ISO3": "IRQ",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Afghanistan",
            "ISO3": "AFG",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Turkmenistan",
            "ISO3": "TKM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Azerbaijan",
            "ISO3": "ZAE",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Türkiye",
            "ISO3": "TUR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Tajikistan",
            "ISO3": "TJK",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "North Korea",
            "ISO3": "PRK",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Uzbekistan",
            "ISO3": "UZB",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Armenia",
            "ISO3": "ARM",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Holy See",
            "ISO3": "VAT",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Portugal",
            "ISO3": "PRT",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Georgia",
            "ISO3": "GEO",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "North Macedonia",
            "ISO3": "MKD",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Andorra",
            "ISO3": "AND",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Albania",
            "ISO3": "ALB",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Croatia",
            "ISO3": "HRV",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "France",
            "ISO3": "FRA",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Russia",
            "ISO3": "RUS",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Kyrgyzstan",
            "ISO3": "KGZ",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Kosovo",
            "ISO3": "XXK",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Canada",
            "ISO3": "CAN",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Montenegro",
            "ISO3": "MNE",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "San Marino",
            "ISO3": "SMR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Bulgaria",
            "ISO3": "BGR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Kazakhstan",
            "ISO3": "KAZ",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Bosnia and Herzegovina",
            "ISO3": "BIH",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Ukraine",
            "ISO3": "UKR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Serbia",
            "ISO3": "SRB",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Saint Pierre and Miquelon",
            "ISO3": "SPM",
            "region": "",
            "type": "Dependency"
        },
        {
            "name": "Liechtenstein",
            "ISO3": "LIE",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Germany",
            "ISO3": "DEU",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Switzerland",
            "ISO3": "CHE",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Romania",
            "ISO3": "ROU",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Moldova",
            "ISO3": "MDA",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Hungary",
            "ISO3": "HUN",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Austria",
            "ISO3": "AUT",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Jersey",
            "ISO3": "JEY",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Guernsey",
            "ISO3": "GGY",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Slovakia",
            "ISO3": "SVK",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "United Kingdom",
            "ISO3": "GBR",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Luxembourg",
            "ISO3": "LUX",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Czechia",
            "ISO3": "CZE",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Belgium",
            "ISO3": "BEL",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Mongolia",
            "ISO3": "MNG",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Netherlands",
            "ISO3": "NLD",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Ireland",
            "ISO3": "IRL",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Poland",
            "ISO3": "POL",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Isle of Man",
            "ISO3": "IMN",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Denmark",
            "ISO3": "DNK",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Lithuania",
            "ISO3": "LTU",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Sweden",
            "ISO3": "SWE",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Belarus",
            "ISO3": "BLR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Estonia",
            "ISO3": "EST",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Norway",
            "ISO3": "NOR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Latvia",
            "ISO3": "LVA",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Finland",
            "ISO3": "FIN",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Greenland",
            "ISO3": "DNK",
            "region": "MENAE",
            "type": "Country"
        },
        {
            "name": "Faroe Islands",
            "ISO3": "FRO",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "Iceland",
            "ISO3": "ISL",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Jan Mayen",
            "ISO3": "SJM",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "Svalbard",
            "ISO3": "SJM",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "Angola",
            "ISO3": "AGO",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Namibia",
            "ISO3": "NAM",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Guatemala",
            "ISO3": "GTM",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "El Salvador",
            "ISO3": "SLV",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "Costa Rica",
            "ISO3": "CRI",
            "region": "ALAC",
            "type": "Sovereign country"
        },
        {
            "name": "The Gambia",
            "ISO3": "GMB",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Liberia",
            "ISO3": "LBR",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Ghana",
            "ISO3": "GHA",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Jordan",
            "ISO3": "JOR",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Dhekelia",
            "ISO3": "XXD",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "Akrotiri",
            "ISO3": "XQZ",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "Slovenia",
            "ISO3": "SVN",
            "region": "MENAE",
            "type": "Sovereign country"
        },
        {
            "name": "Gibraltar",
            "ISO3": "GIB",
            "region": "MENAE",
            "type": "Dependency"
        },
        {
            "name": "Pitcairn Islands",
            "ISO3": "PCN",
            "region": "ALAC",
            "type": "Dependency"
        },
        {
            "name": "",
            "ISO3": "",
            "region": "ALAC",
            "type": "Indeterminate"
        },
        {
            "name": "Djibouti",
            "ISO3": "DJI",
            "region": "Africa",
            "type": "Sovereign country"
        },
        {
            "name": "Bonaire",
            "ISO3": "BES",
            "region": "ALAC",
            "type": "Overseas Division"
        },
        {
            "name": "Sint Eustatius",
            "ISO3": "BES",
            "region": "ALAC",
            "type": "Overseas Division"
        },
        {
            "name": "Saba",
            "ISO3": "BES",
            "region": "ALAC",
            "type": "Overseas Division"
        },
        {
            "name": "Sint Maarten",
            "ISO3": "SXM",
            "region": "ALAC",
            "type": "Dependency"
        }
    ]
  })
});