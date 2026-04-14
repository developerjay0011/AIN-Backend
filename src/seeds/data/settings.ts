export const initialSettings = [
    { key_name: 'INSTITUTE_EMAIL', value: 'ain@awesindia.edu.in', label: 'Email Address', group_name: 'Contact' },
    { key_name: 'INSTITUTE_PHONE', value: '+91 6901299910', label: 'Phone Number', group_name: 'Contact' },
    { key_name: 'INSTITUTE_ADDRESS', value: 'C/O 151 Base Hospital, Basistha, Guwahati, Assam 781029', label: 'Full Address', group_name: 'Contact' },
    { key_name: 'INSTITUTE_MOTTO', value: 'Healing Hands, Compassionate hearts', label: 'Institute Motto', group_name: 'General' },
    { key_name: 'INSTITUTE_TAGLINE', value: "Empowering lives through healthcare excellence. North East India's premier Nursing Institute.", label: 'Institute Tagline', group_name: 'General' },
    { key_name: 'SOCIAL_FACEBOOK', value: 'https://www.facebook.com/share/18QkF38eA5/', label: 'Facebook Link', group_name: 'Social' },
    { key_name: 'SOCIAL_INSTAGRAM', value: 'https://www.instagram.com/ain_guwahati?igsh=cWZ6N2tnbWRsbWIx&utm_source=ig_contact_invite', label: 'Instagram Link', group_name: 'Social' },
    { key_name: 'GOOGLE_MAPS_EMBED_URL', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3582.835438338517!2d91.79357087581805!3d26.104289994363594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a5f2109f4a7b7%3A0xcf8037a4cb6df55d!2sArmy%20Institute%20of%20Nursing!5e0!3m2!1sen!2sin!4v1774261815749!5m2!1sen!2sin', label: 'Google Maps Embed URL', group_name: 'Map' },
    {
        key_name: 'AFFILIATIONS',
        value: JSON.stringify([
            { initials: 'INC', name: 'Indian Nursing Council, New Delhi', url: 'https://www.indiannursingcouncil.org', logo: 'http://localhost:5001/uploads/inc-logo.png' },
            { initials: 'ANMHVC', name: "Assam Nurses' Midwives' & Health Visitors' Council, Guwahati", url: 'https://www.assamnursingcouncil.com/', logo: 'http://localhost:5001/uploads/anmhvc-logo.png' },
            { initials: 'SSUHS', name: 'Srimanta Sankaradeva University of Health Sciences, Assam', url: 'https://ssuhs.ac.in/', logo: 'http://localhost:5001/uploads/ssuhs-logo.png' },
            { initials: 'TNAI', name: 'Trained Nurses Association of India', url: 'https://www.tnaionline.org', logo: 'http://localhost:5001/uploads/tnai-logo.png' },
            { initials: 'AWES', name: 'Army Welfare Education Society', url: 'https://www.awesindia.com/', logo: 'http://localhost:5001/uploads/awes-logo.png' }
        ]),
        label: 'Affiliations List',
        group_name: 'General',
        type: 'json'
    },
    { key_name: 'WEBSITE_LAST_UPDATED', value: '11-04-2026', label: 'Website last updated date', group_name: 'General' },
    { key_name: 'ADMIN_DASHBOARD_URL', value: 'http://localhost:5173', label: 'Admin Dashboard Base URL', group_name: 'General' },
];
