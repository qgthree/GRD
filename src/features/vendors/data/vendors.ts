import type { Vendor } from '@/features/vendors/types'

// Local seed data used until vendors are provided by an external API.
export const vendors: Vendor[] = [
  {
    id: 1,
    company_name: 'Global Relief Logistics',
    state: ['Global'],
    subsectors: ['48-49', '56', '92'],
    district_location: [],
    'city_/_subsidiary_location': 'Washington, DC',
    'primary_contact(s)': 'Emma Carter',
    phone: '+1 202-555-1010',
    url: 'https://globalrelieflogistics.example',
    previously_used: true,
    isVisible: false
  },
  {
    id: 2,
    company_name: 'AquaSafe Purification',
    state: ['California'],
    subsectors: ['11', '22', '42'],
    district_location: ['0612', '0634'],
    'city_/_subsidiary_location': 'Sacramento, CA',
    'primary_contact(s)': 'James Alvarez',
    phone: '+1 916-555-2020',
    url: 'https://aquasafepurification.example',
    previously_used: true,
    isVisible: false
  },
  {
    id: 3,
    company_name: 'RapidMed Response',
    state: ['Texas'],
    subsectors: ['31-33', '61', '62'],
    district_location: ['4821', '4835'],
    'city_/_subsidiary_location': 'Austin, TX',
    'primary_contact(s)': 'Dr. Aisha Morgan',
    phone: '+1 512-555-3030',
    url: 'https://rapidmedresponse.example',
    previously_used: true,
    isVisible: false
  },
  {
    id: 4,
    company_name: 'CrisisCom Networks',
    state: ['California', 'Washington'],
    subsectors: ['51', '52', '54'],
    district_location: ['0611', '5307'],
    'city_/_subsidiary_location': 'Los Angeles, CA',
    'primary_contact(s)': 'Mark Robertson',
    phone: '+1 310-555-4040',
    url: 'https://crisiscomnetworks.example',
    previously_used: false,
    isVisible: false
  },
  {
    id: 5,
    company_name: 'ShelterNow Solutions',
    state: ['Florida'],
    subsectors: ['23', '53', '81'],
    district_location: ['1207', '1223'],
    'city_/_subsidiary_location': 'Tallahassee, FL',
    'primary_contact(s)': 'Ana Bennett',
    phone: '+1 850-555-5050',
    url: 'https://shelternow.example',
    previously_used: true,
    isVisible: false
  },
  {
    id: 6,
    company_name: 'MedSupply Federal',
    state: ['New York'],
    subsectors: ['42', '55', '62'],
    district_location: ['3605', '3612'],
    'city_/_subsidiary_location': 'Albany, NY',
    'primary_contact(s)': 'Dr. Laura Chen',
    phone: '+1 518-555-6060',
    url: 'https://medsupplyfederal.example',
    previously_used: true,
    isVisible: false
  },
  {
    id: 7,
    company_name: 'RescueTech Drones',
    state: ['Colorado', 'Arizona'],
    subsectors: ['44-45', '54', '71'],
    district_location: ['0802', '0403'],
    'city_/_subsidiary_location': 'Denver, CO',
    'primary_contact(s)': 'Samuel Okoro',
    phone: '+1 303-555-7070',
    url: 'https://rescuetechdrones.example',
    previously_used: false,
    isVisible: false
  },
  {
    id: 8,
    company_name: 'Relief Energy Systems',
    state: ['Louisiana'],
    subsectors: ['21', '22', '72'],
    district_location: ['2202', '2206'],
    'city_/_subsidiary_location': 'Baton Rouge, LA',
    'primary_contact(s)': 'Omar Haddad',
    phone: '+1 225-555-8080',
    url: 'https://reliefenergy.example',
    previously_used: true,
    isVisible: false
  }
]
