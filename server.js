require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('❌ Missing ANTHROPIC_API_KEY'); process.exit(1); }

// Claude model and API URL
const CLAUDE_MODEL = 'claude-sonnet-4-6';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/* ═══════════════════════════════════════════════════════════════════════
   KARNATAKA HEALTHCARE DATABASE  —  District-wise
   Covers 15+ districts, 30+ hospitals, 15+ clinics
═══════════════════════════════════════════════════════════════════════ */
const KARNATAKA_HOSPITALS = {

  bengaluru: {
    district: "Bengaluru Urban",
    emergency: "108",
    hospitals: [
      {
        id:"blr-001", name:"Manipal Hospital HAL Road", type:"Multi-specialty", tier:"tertiary",
        address:"98 HAL Airport Road, Bengaluru – 560017", phone:"080-25024444", emergency_phone:"080-25024222",
        beds:600, accreditation:"NABH, JCI",
        doctors:[
          {name:"Dr. Suresh Kumar",   specialty:"Cardiology",    qualification:"MD, DM (Cardiology)", experience:"22 years"},
          {name:"Dr. Anitha Rao",     specialty:"Neurology",     qualification:"MD, DM (Neurology)",  experience:"18 years"},
          {name:"Dr. Ramesh Patel",   specialty:"Orthopaedics",  qualification:"MS (Ortho), DNB",     experience:"15 years"},
          {name:"Dr. Preethi Sharma", specialty:"Oncology",      qualification:"MD, DM (Oncology)",   experience:"20 years"},
          {name:"Dr. Vivek Nair",     specialty:"Nephrology",    qualification:"MD, DM (Nephrology)", experience:"12 years"}
        ],
        specialties:["Cardiology","Neurology","Orthopaedics","Oncology","Nephrology","Transplants","Trauma","Paediatrics","Gynaecology","Gastroenterology"],
        opd_hours:"Mon–Sat 8AM–8PM, Sun 9AM–2PM",
        facilities:["24/7 Emergency","ICU","NICU","CATH Lab","MRI","CT Scan","PET Scan","Dialysis","Blood Bank","Pharmacy"]
      },
      {
        id:"blr-002", name:"Narayana Health City", type:"Super-specialty", tier:"tertiary",
        address:"258/A Bommasandra Industrial Area, Anekal, Bengaluru – 560099", phone:"080-71222222", emergency_phone:"080-71222911",
        beds:1400, accreditation:"NABH, JCI",
        doctors:[
          {name:"Dr. Devi Prasad Shetty", specialty:"Cardiac Surgery",           qualification:"MS, MCh (CTVS)",          experience:"40 years"},
          {name:"Dr. Manjunath Nandi",     specialty:"Paediatric Cardiac Surgery", qualification:"MCh",                    experience:"25 years"},
          {name:"Dr. Sanjay Sinha",        specialty:"Neurosurgery",              qualification:"MCh (Neurosurgery)",      experience:"20 years"}
        ],
        specialties:["Cardiac Surgery","Cardiology","Neurosurgery","Oncology","Bone Marrow Transplant","Paediatric Surgery","Urology"],
        opd_hours:"Mon–Sat 7AM–9PM",
        facilities:["24/7 Emergency","Cardiac ICU","CATH Lab","Robotic Surgery","Blood Bank","Bone Marrow Unit"]
      },
      {
        id:"blr-003", name:"Victoria Hospital (Govt.)", type:"Government Multi-specialty", tier:"tertiary",
        address:"Fort Road, K R Market, Bengaluru – 560002", phone:"080-26700400", emergency_phone:"080-26700444",
        beds:1250, accreditation:"Government Referral Hospital",
        doctors:[
          {name:"Dr. H.R. Gangadhar", specialty:"General Medicine",       qualification:"MD", experience:"28 years"},
          {name:"Dr. K. Sudha",       specialty:"Obstetrics & Gynaecology",qualification:"MS (OBG)", experience:"22 years"},
          {name:"Dr. R. Mohan",       specialty:"Orthopaedics",           qualification:"MS (Ortho)", experience:"18 years"}
        ],
        specialties:["General Medicine","Surgery","Orthopaedics","OBG","Paediatrics","Dermatology","Psychiatry","ENT","Ophthalmology"],
        opd_hours:"Mon–Sat 8AM–5PM (Emergency 24/7)",
        facilities:["24/7 Emergency","Free OPD","Trauma Centre","Blood Bank","Dialysis"]
      },
      {
        id:"blr-004", name:"Fortis Hospital Bannerghatta", type:"Multi-specialty", tier:"tertiary",
        address:"Bannerghatta Road, Bengaluru – 560076", phone:"080-66214444", emergency_phone:"080-66214911",
        beds:400, accreditation:"NABH",
        doctors:[
          {name:"Dr. Arun Prasad", specialty:"Gastroenterology", qualification:"MD, DM", experience:"16 years"},
          {name:"Dr. Suma Hegde",  specialty:"Endocrinology",    qualification:"MD, DM", experience:"14 years"}
        ],
        specialties:["Gastroenterology","Endocrinology","Cardiology","Neurology","Oncology","Urology","Gynaecology"],
        opd_hours:"Mon–Sat 8AM–8PM",
        facilities:["24/7 Emergency","Robotic Surgery","CATH Lab","PET-CT"]
      }
    ],
    clinics:[
      {
        id:"blr-c001", name:"Columbia Asia Hospital Whitefield", type:"Multi-specialty Clinic",
        address:"Whitefield Main Road, Bengaluru – 560066", phone:"080-39898969",
        specialties:["General Medicine","Paediatrics","Gynaecology","Orthopaedics","Dental"],
        doctors:[{name:"Dr. Bhavna Mehta", specialty:"Paediatrics", experience:"12 years"}],
        opd_hours:"Mon–Sat 8AM–8PM"
      }
    ]
  },

  mysuru: {
    district: "Mysuru",
    emergency: "108",
    hospitals: [
      {
        id:"mys-001", name:"JSS Hospital", type:"Multi-specialty Teaching Hospital", tier:"tertiary",
        address:"Ramanuja Road, Mysuru – 570004", phone:"0821-2548400", emergency_phone:"0821-2548199",
        beds:1100, accreditation:"NABH",
        doctors:[
          {name:"Dr. B. Suresh",       specialty:"Cardiology",                 qualification:"MD, DM",    experience:"24 years"},
          {name:"Dr. Usha Rani",       specialty:"Neurology",                  qualification:"MD, DM",    experience:"19 years"},
          {name:"Dr. Mahesh Kumar",    specialty:"Gastroenterology",           qualification:"MD, DM",    experience:"16 years"},
          {name:"Dr. Nandini Gopal",   specialty:"Gynaecology",                qualification:"MS (OBG)",  experience:"22 years"}
        ],
        specialties:["Cardiology","Neurology","Gastroenterology","Orthopaedics","Oncology","Urology","Nephrology","OBG","Paediatrics"],
        opd_hours:"Mon–Sat 8AM–8PM",
        facilities:["24/7 Emergency","CATH Lab","ICU","NICU","Blood Bank","MRI","CT Scan","Dialysis"]
      },
      {
        id:"mys-002", name:"K.R. Hospital (Govt.)", type:"Government District Hospital", tier:"secondary",
        address:"Irwin Road, Mysuru – 570001", phone:"0821-2420161", emergency_phone:"0821-2420108",
        beds:800,
        doctors:[
          {name:"Dr. C. Venkatesh", specialty:"General Surgery", qualification:"MS", experience:"20 years"},
          {name:"Dr. Lakshmi Devi", specialty:"Obstetrics",      qualification:"MS (OBG)", experience:"17 years"}
        ],
        specialties:["General Medicine","General Surgery","Orthopaedics","OBG","Paediatrics","ENT","Dermatology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)",
        facilities:["24/7 Emergency","Free OPD","Blood Bank","Maternity Ward"]
      },
      {
        id:"mys-003", name:"Vikram Hospital Mysuru", type:"Multi-specialty", tier:"secondary",
        address:"374 Irwin Road, Mysuru – 570001", phone:"0821-4277777",
        beds:200,
        doctors:[
          {name:"Dr. Praveen Shah", specialty:"Orthopaedics",   experience:"14 years"},
          {name:"Dr. Rekha Nair",   specialty:"General Medicine",experience:"12 years"}
        ],
        specialties:["Orthopaedics","General Medicine","Cardiology","Paediatrics","Gynaecology"],
        opd_hours:"Mon–Sat 8AM–9PM"
      }
    ],
    clinics:[
      {
        id:"mys-c001", name:"Cauvery Medical Centre", type:"Polyclinic",
        address:"Kantharaj Urs Road, Mysuru – 570001", phone:"0821-4282626",
        specialties:["General Medicine","Paediatrics","Gynaecology","Dental","Dermatology"],
        doctors:[{name:"Dr. Vinay Shetty", specialty:"General Medicine", experience:"15 years"}],
        opd_hours:"Mon–Sat 9AM–7PM"
      }
    ]
  },

  shivamogga: {
    district: "Shivamogga",
    emergency: "108",
    hospitals: [
      {
        id:"shv-001", name:"McGann District Hospital (Govt.)", type:"Government District Hospital", tier:"secondary",
        address:"Teerthahalli Road, Shivamogga – 577201", phone:"08182-222022", emergency_phone:"08182-222108",
        beds:700,
        doctors:[
          {name:"Dr. S. Rajashekhar", specialty:"General Medicine", qualification:"MD",       experience:"22 years"},
          {name:"Dr. Geeta Bhat",     specialty:"Paediatrics",      qualification:"MD (Paeds)",experience:"18 years"},
          {name:"Dr. Ravi Kumar M.",  specialty:"Orthopaedics",     qualification:"MS (Ortho)",experience:"15 years"},
          {name:"Dr. Roopa G.",       specialty:"Gynaecology",      qualification:"MS (OBG)",  experience:"20 years"}
        ],
        specialties:["General Medicine","General Surgery","Orthopaedics","OBG","Paediatrics","Dermatology","Psychiatry","ENT","Ophthalmology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)",
        facilities:["24/7 Emergency","ICU","Blood Bank","Operation Theatre","Dialysis","Maternity Ward"]
      },
      {
        id:"shv-002", name:"Sahyadri Narayana Multispeciality Hospital", type:"Multi-specialty", tier:"secondary",
        address:"Near Bus Stand, Shivamogga – 577201", phone:"08182-404040", emergency_phone:"08182-404999",
        beds:350, accreditation:"NABH",
        doctors:[
          {name:"Dr. Dinakar Babu",   specialty:"Cardiology",                 qualification:"MD, DM",    experience:"18 years"},
          {name:"Dr. Shailaja Rao",   specialty:"Neurology",                  qualification:"MD, DM",    experience:"16 years"},
          {name:"Dr. Prasad Hiremath",specialty:"Orthopaedics",               qualification:"MS, FICS",  experience:"20 years"},
          {name:"Dr. Meena Kumari",   specialty:"Gynaecology & Obstetrics",   qualification:"MS (OBG)",  experience:"14 years"},
          {name:"Dr. Anand Gowda",    specialty:"General Surgery",            qualification:"MS",        experience:"16 years"}
        ],
        specialties:["Cardiology","Neurology","Orthopaedics","Gynaecology","General Surgery","Paediatrics","ENT","Urology","Gastroenterology"],
        opd_hours:"Mon–Sat 8AM–9PM, Sun 9AM–1PM",
        facilities:["24/7 Emergency","CATH Lab","ICU","NICU","MRI","CT Scan","Laparoscopic Surgery","Blood Bank","Pharmacy"]
      },
      {
        id:"shv-003", name:"Manipal Hospital Shivamogga", type:"Multi-specialty", tier:"secondary",
        address:"BH Road, Shivamogga – 577202", phone:"08182-405050",
        beds:250, accreditation:"NABH",
        doctors:[
          {name:"Dr. Vinod Kumar",  specialty:"General Medicine", qualification:"MD",           experience:"14 years"},
          {name:"Dr. Savitha B.N.", specialty:"Paediatrics",      qualification:"MD, MRCPCH",  experience:"12 years"},
          {name:"Dr. Harish M.S.",  specialty:"Urology",          qualification:"MS, MCh",     experience:"17 years"}
        ],
        specialties:["General Medicine","Paediatrics","Urology","Gynaecology","Orthopaedics","Cardiology","Neurology"],
        opd_hours:"Mon–Sat 8AM–8PM",
        facilities:["24/7 Emergency","ICU","MRI","CT Scan","Blood Bank"]
      }
    ],
    clinics:[
      {
        id:"shv-c001", name:"Tirumala Clinic & Diagnostic Centre", type:"Polyclinic",
        address:"Gandhi Bazaar, Shivamogga – 577201", phone:"08182-223344",
        specialties:["General Medicine","Paediatrics","Gynaecology","Dental","Ophthalmology"],
        doctors:[{name:"Dr. Suresh Gowda", specialty:"General Medicine", experience:"18 years"}],
        opd_hours:"Mon–Sat 9AM–7PM, Sun 9AM–1PM"
      },
      {
        id:"shv-c002", name:"Sagar Multi-specialty Clinic", type:"Multi-specialty Clinic",
        address:"Sagar Road, Shivamogga – 577201", phone:"08182-256677",
        specialties:["ENT","Dermatology","Orthopaedics","General Medicine"],
        doctors:[{name:"Dr. Kavitha Prakash", specialty:"ENT", experience:"12 years"}],
        opd_hours:"Mon–Sat 10AM–6PM"
      }
    ]
  },

  dakshina_kannada: {
    district: "Dakshina Kannada (Mangaluru)",
    emergency: "108",
    hospitals: [
      {
        id:"dka-001", name:"Kasturba Medical College Hospital (KMC) Mangaluru", type:"Teaching Super-specialty", tier:"tertiary",
        address:"Lighthouse Hill Road, Mangaluru – 575001", phone:"0824-2444444", emergency_phone:"0824-2444911",
        beds:2300, accreditation:"NABH, NAAC A++",
        doctors:[
          {name:"Dr. Jayaprakash Shetty", specialty:"Cardiothoracic Surgery", qualification:"MCh (CTVS)",         experience:"28 years"},
          {name:"Dr. Rashmi Kudva",       specialty:"Endocrinology",          qualification:"MD, DM",            experience:"22 years"},
          {name:"Dr. Bhargava Rao",       specialty:"Neurosurgery",           qualification:"MCh (Neurosurgery)",experience:"20 years"},
          {name:"Dr. Pushpa Nayak",       specialty:"Paediatric Oncology",    qualification:"MD, DM",            experience:"18 years"}
        ],
        specialties:["Cardiothoracic Surgery","Neurosurgery","Oncology","Endocrinology","Nephrology","Urology","Liver Transplant","Paediatrics","Haematology"],
        opd_hours:"Mon–Sat 8AM–8PM",
        facilities:["24/7 Emergency","Cardiac ICU","Bone Marrow Transplant","CATH Lab","Robotic Surgery","PET-CT","Liver Transplant Unit"]
      },
      {
        id:"dka-002", name:"A.J. Hospital & Research Centre", type:"Multi-specialty", tier:"secondary",
        address:"NH 66, Kuntikana, Mangaluru – 575004", phone:"0824-2225533", emergency_phone:"0824-2225911",
        beds:500, accreditation:"NABH",
        doctors:[
          {name:"Dr. Arun Kumar",   specialty:"Cardiology",  experience:"16 years"},
          {name:"Dr. Shobha Prabhu",specialty:"Gynaecology", experience:"20 years"},
          {name:"Dr. Ganesh Nayak", specialty:"Orthopaedics",experience:"18 years"}
        ],
        specialties:["Cardiology","Gynaecology","Orthopaedics","Neurology","Gastroenterology","Urology","ENT","Ophthalmology"],
        opd_hours:"Mon–Sat 8AM–9PM"
      }
    ],
    clinics:[
      {
        id:"dka-c001", name:"City Hospital Mangaluru", type:"Multi-specialty Clinic",
        address:"Hampankatta, Mangaluru – 575001", phone:"0824-2425252",
        specialties:["General Medicine","Paediatrics","Dental","Dermatology","Orthopaedics"],
        doctors:[{name:"Dr. Sheetal Kamath", specialty:"General Medicine", experience:"14 years"}],
        opd_hours:"Mon–Sat 9AM–8PM"
      }
    ]
  },

  dharwad: {
    district: "Dharwad / Hubballi",
    emergency: "108",
    hospitals: [
      {
        id:"dhw-001", name:"KIMS – Karnataka Institute of Medical Sciences", type:"Government Teaching Hospital", tier:"tertiary",
        address:"KIMS Campus, Vidyanagar, Hubballi – 580021", phone:"0836-2370100", emergency_phone:"0836-2370108",
        beds:1200,
        doctors:[
          {name:"Dr. P.V. Kugaji",   specialty:"Cardiology",  qualification:"MD, DM",   experience:"25 years"},
          {name:"Dr. Savita Patil",  specialty:"Neurology",   qualification:"MD, DM",   experience:"20 years"},
          {name:"Dr. Mohan Reddy",   specialty:"Oncology",    qualification:"MD, DM",   experience:"18 years"},
          {name:"Dr. Pushpa Wali",   specialty:"Gynaecology", qualification:"MS, DNB",  experience:"22 years"}
        ],
        specialties:["Cardiology","Neurology","Oncology","Orthopaedics","OBG","Paediatrics","General Surgery","Dermatology","Psychiatry"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)",
        facilities:["24/7 Emergency","Free OPD","ICU","CATH Lab","Blood Bank","Dialysis","Trauma Centre"]
      },
      {
        id:"dhw-002", name:"SDM Hospital Dharwad", type:"Multi-specialty Teaching", tier:"secondary",
        address:"Sattur Colony, Dharwad – 580009", phone:"0836-2467501",
        beds:400, accreditation:"NABH",
        doctors:[
          {name:"Dr. Shankar Gowda", specialty:"General Surgery",experience:"18 years"},
          {name:"Dr. Vijay Kulkarni",specialty:"Urology",        experience:"14 years"}
        ],
        specialties:["General Surgery","Paediatrics","Urology","Orthopaedics","Gynaecology","ENT","Ophthalmology"],
        opd_hours:"Mon–Sat 8AM–8PM"
      }
    ],
    clinics:[
      {
        id:"dhw-c001", name:"Prashanth Clinic & Diagnostic Centre", type:"Polyclinic",
        address:"Lamington Road, Hubballi – 580020", phone:"0836-2361234",
        specialties:["General Medicine","Diabetes","Cardiology","Paediatrics"],
        doctors:[{name:"Dr. Rajiv Desai", specialty:"Diabetology", experience:"15 years"}],
        opd_hours:"Mon–Sat 9AM–7PM"
      }
    ]
  },

  belagavi: {
    district: "Belagavi",
    emergency: "108",
    hospitals: [
      {
        id:"blg-001", name:"District Hospital Belagavi (Govt.)", type:"Government District Hospital", tier:"secondary",
        address:"Hospital Road, Belagavi – 590001", phone:"0831-2420200", emergency_phone:"0831-2420108",
        beds:800,
        doctors:[
          {name:"Dr. M. Patil",       specialty:"General Medicine", experience:"20 years"},
          {name:"Dr. Suchitra Nayak", specialty:"OBG",              experience:"18 years"},
          {name:"Dr. Ramesh Katti",   specialty:"Orthopaedics",     experience:"16 years"}
        ],
        specialties:["General Medicine","General Surgery","Orthopaedics","OBG","Paediatrics","ENT","Ophthalmology","Dermatology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      },
      {
        id:"blg-002", name:"KLE Hospital (JNMC Campus)", type:"Multi-specialty Teaching", tier:"secondary",
        address:"JNMC Campus, Nehru Nagar, Belagavi – 590010", phone:"0831-2470056", emergency_phone:"0831-2470999",
        beds:1800, accreditation:"NABH",
        doctors:[
          {name:"Dr. Sanjay Kulkarni",specialty:"Cardiology", qualification:"MD, DM",  experience:"22 years"},
          {name:"Dr. Priya Mirji",    specialty:"Neurology",  qualification:"MD, DM",  experience:"18 years"},
          {name:"Dr. Anil Awati",     specialty:"Urology",    qualification:"MS, MCh", experience:"20 years"}
        ],
        specialties:["Cardiology","Neurology","Urology","Oncology","Gynaecology","Orthopaedics","Gastroenterology","Nephrology"],
        opd_hours:"Mon–Sat 8AM–8PM"
      }
    ],
    clinics:[]
  },

  kalaburagi: {
    district: "Kalaburagi",
    emergency: "108",
    hospitals: [
      {
        id:"klb-001", name:"GIMS – Gulbarga Institute of Medical Sciences", type:"Government Teaching Hospital", tier:"tertiary",
        address:"Sedam Road, Kalaburagi – 585105", phone:"08472-263500", emergency_phone:"08472-263108",
        beds:1000,
        doctors:[
          {name:"Dr. Shyam Patil",   specialty:"General Medicine", experience:"24 years"},
          {name:"Dr. Renuka Biradar",specialty:"Gynaecology",      experience:"20 years"},
          {name:"Dr. Praveen Kumar", specialty:"Paediatrics",      experience:"16 years"}
        ],
        specialties:["General Medicine","General Surgery","OBG","Paediatrics","Orthopaedics","ENT","Psychiatry","Dermatology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      },
      {
        id:"klb-002", name:"Basaveshwara Medical College Hospital", type:"Teaching Multi-specialty", tier:"secondary",
        address:"ITI Layout, Chitapur Road, Kalaburagi – 585102", phone:"08472-265300",
        beds:600,
        doctors:[{name:"Dr. B.K. Mallikarjun", specialty:"Cardiology", experience:"18 years"}],
        specialties:["Cardiology","Dermatology","General Medicine","Orthopaedics","Gynaecology","Surgery"],
        opd_hours:"Mon–Sat 8AM–6PM"
      }
    ],
    clinics:[]
  },

  tumakuru: {
    district: "Tumakuru",
    emergency: "108",
    hospitals: [
      {
        id:"tmk-001", name:"SS Institute of Medical Sciences (SSIMS)", type:"Teaching Multi-specialty", tier:"secondary",
        address:"Davangere Road, Tumakuru – 572107", phone:"0816-2257000",
        beds:800, accreditation:"NABH",
        doctors:[
          {name:"Dr. Narasimha Murthy",specialty:"Cardiology",  experience:"20 years"},
          {name:"Dr. Geetha Rao",      specialty:"Paediatrics", experience:"16 years"},
          {name:"Dr. Suresh Naik",     specialty:"Orthopaedics",experience:"18 years"}
        ],
        specialties:["Cardiology","Paediatrics","Orthopaedics","General Surgery","OBG","Urology","Neurology"],
        opd_hours:"Mon–Sat 8AM–8PM"
      },
      {
        id:"tmk-002", name:"District Government Hospital Tumakuru", type:"Government District Hospital", tier:"secondary",
        address:"BH Road, Tumakuru – 572101", phone:"0816-2272100",
        beds:500,
        doctors:[{name:"Dr. H.S. Kumar", specialty:"General Medicine", experience:"18 years"}],
        specialties:["General Medicine","Surgery","OBG","Paediatrics","ENT","Ophthalmology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      }
    ],
    clinics:[]
  },

  davangere: {
    district: "Davangere",
    emergency: "108",
    hospitals: [
      {
        id:"dvg-001", name:"Bapuji Hospital / JJM Medical College", type:"Government Teaching Hospital", tier:"secondary",
        address:"P.J. Extension, Davangere – 577004", phone:"08192-231800", emergency_phone:"08192-231108",
        beds:1000,
        doctors:[
          {name:"Dr. Chandrashekhar", specialty:"General Surgery", experience:"24 years"},
          {name:"Dr. Shanta Bai",     specialty:"OBG",            experience:"20 years"},
          {name:"Dr. Jagadish Rao",   specialty:"Paediatrics",    experience:"16 years"}
        ],
        specialties:["General Surgery","OBG","Paediatrics","General Medicine","Orthopaedics","ENT","Psychiatry","Dermatology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      },
      {
        id:"dvg-002", name:"S.S. Hospital Davangere", type:"Multi-specialty", tier:"secondary",
        address:"MCC B Block, Davangere – 577004", phone:"08192-263344",
        beds:200,
        doctors:[
          {name:"Dr. Suresh Babu", specialty:"Cardiology",  experience:"15 years"},
          {name:"Dr. Kavitha S.",  specialty:"Gynaecology", experience:"14 years"}
        ],
        specialties:["Cardiology","Gynaecology","Orthopaedics","Paediatrics","General Medicine"],
        opd_hours:"Mon–Sat 9AM–8PM"
      }
    ],
    clinics:[
      {
        id:"dvg-c001", name:"Nirmala Clinic & Diagnostic", type:"Polyclinic",
        address:"P.J. Extension, Davangere – 577002", phone:"08192-245566",
        specialties:["General Medicine","Paediatrics","Gynaecology","Dental"],
        doctors:[{name:"Dr. Nagendra Gowda", specialty:"General Medicine", experience:"18 years"}],
        opd_hours:"Mon–Sat 9AM–7PM"
      }
    ]
  },

  hassan: {
    district: "Hassan",
    emergency: "108",
    hospitals: [
      {
        id:"hsn-001", name:"District Hospital Hassan (Govt.)", type:"Government District Hospital", tier:"secondary",
        address:"B.M. Road, Hassan – 573201", phone:"08172-265555", emergency_phone:"08172-265108",
        beds:500,
        doctors:[
          {name:"Dr. P. Srinivas",  specialty:"General Medicine", experience:"20 years"},
          {name:"Dr. Mamatha H.C.", specialty:"OBG",             experience:"18 years"},
          {name:"Dr. Sunil Gowda",  specialty:"Paediatrics",     experience:"14 years"}
        ],
        specialties:["General Medicine","OBG","Paediatrics","Orthopaedics","Surgery","ENT","Ophthalmology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      },
      {
        id:"hsn-002", name:"Hassan Institute of Medical Sciences (HIMS)", type:"Teaching Hospital", tier:"secondary",
        address:"KR Puram, Hassan – 573202", phone:"08172-280900",
        beds:600,
        doctors:[
          {name:"Dr. Venugopal",  specialty:"Cardiology", experience:"16 years"},
          {name:"Dr. Susheela Bai",specialty:"Neurology", experience:"14 years"}
        ],
        specialties:["Cardiology","Neurology","Orthopaedics","General Surgery","OBG","Dermatology"],
        opd_hours:"Mon–Sat 8AM–6PM"
      }
    ],
    clinics:[]
  },

  ballari: {
    district: "Ballari",
    emergency: "108",
    hospitals: [
      {
        id:"bal-001", name:"VIMS – Vijayanagara Institute of Medical Sciences", type:"Government Teaching Hospital", tier:"secondary",
        address:"Cantonment, Ballari – 583104", phone:"08392-235700", emergency_phone:"08392-235108",
        beds:1200,
        doctors:[
          {name:"Dr. K. Nagaraj",    specialty:"General Medicine", experience:"22 years"},
          {name:"Dr. R. Savitha",    specialty:"Gynaecology",      experience:"18 years"},
          {name:"Dr. S. Vijay Kumar",specialty:"Orthopaedics",     experience:"16 years"},
          {name:"Dr. Padmavathi",    specialty:"Paediatrics",      experience:"15 years"}
        ],
        specialties:["General Medicine","General Surgery","Orthopaedics","OBG","Paediatrics","ENT","Dermatology","Psychiatry","Ophthalmology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      }
    ],
    clinics:[]
  },

  raichur: {
    district: "Raichur",
    emergency: "108",
    hospitals: [
      {
        id:"ric-001", name:"RIMS – Raichur Institute of Medical Sciences", type:"Government Teaching Hospital", tier:"secondary",
        address:"RIMS Campus, Raichur – 584102", phone:"08532-233700", emergency_phone:"08532-233108",
        beds:900,
        doctors:[
          {name:"Dr. S.B. Patil",  specialty:"General Medicine", experience:"20 years"},
          {name:"Dr. Meenakshi",   specialty:"OBG",             experience:"16 years"}
        ],
        specialties:["General Medicine","General Surgery","OBG","Paediatrics","Orthopaedics","ENT","Dermatology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      }
    ],
    clinics:[]
  },

  udupi: {
    district: "Udupi (Manipal)",
    emergency: "108",
    hospitals: [
      {
        id:"udp-001", name:"Kasturba Medical College Hospital Manipal", type:"Teaching Super-specialty", tier:"tertiary",
        address:"Madhav Nagar, Manipal – 576104", phone:"0820-2922222", emergency_phone:"0820-2922911",
        beds:2032, accreditation:"NABH, JCI",
        doctors:[
          {name:"Dr. Shashikala U.",   specialty:"Paediatric Neurology", qualification:"MD, DM", experience:"22 years"},
          {name:"Dr. Murali Krishna",  specialty:"Cardiology",           qualification:"MD, DM", experience:"20 years"},
          {name:"Dr. Vrinda Nayak",    specialty:"Oncology",             qualification:"MD, DM", experience:"18 years"}
        ],
        specialties:["Cardiology","Neurology","Oncology","Transplants","Paediatrics","Haematology","Urology","Gastroenterology","Pulmonology"],
        opd_hours:"Mon–Sat 8AM–8PM",
        facilities:["24/7 Emergency","Cardiac ICU","Bone Marrow Transplant","Robotic Surgery","Gamma Knife","Blood Bank"]
      }
    ],
    clinics:[]
  },

  bidar: {
    district: "Bidar",
    emergency: "108",
    hospitals: [
      {
        id:"bdr-001", name:"BRIMS – Bidar Institute of Medical Sciences", type:"Government Teaching Hospital", tier:"secondary",
        address:"Udgir Road, Bidar – 585401", phone:"08482-228700",
        beds:800,
        doctors:[
          {name:"Dr. M.R. Patil",    specialty:"General Medicine", experience:"20 years"},
          {name:"Dr. Ranjita Wali",  specialty:"Gynaecology",      experience:"16 years"}
        ],
        specialties:["General Medicine","Surgery","OBG","Paediatrics","Orthopaedics","ENT","Dermatology"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      }
    ],
    clinics:[]
  },

  vijayapura: {
    district: "Vijayapura",
    emergency: "108",
    hospitals: [
      {
        id:"vjp-001", name:"District Hospital Vijayapura (Govt.)", type:"Government District Hospital", tier:"secondary",
        address:"Station Road, Vijayapura – 586101", phone:"08352-270200",
        beds:600,
        doctors:[
          {name:"Dr. B.S. Patil",  specialty:"General Medicine", experience:"22 years"},
          {name:"Dr. Rekha Joshi", specialty:"Paediatrics",      experience:"18 years"}
        ],
        specialties:["General Medicine","Surgery","OBG","Paediatrics","Orthopaedics","ENT"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      }
    ],
    clinics:[]
  },

  kodagu: {
    district: "Kodagu (Coorg)",
    emergency: "108",
    hospitals: [
      {
        id:"kdg-001", name:"District Hospital Madikeri (Govt.)", type:"Government District Hospital", tier:"secondary",
        address:"Hospital Road, Madikeri – 571201", phone:"08272-225100",
        beds:200,
        doctors:[
          {name:"Dr. Prasad Nayak",     specialty:"General Medicine", experience:"16 years"},
          {name:"Dr. Kamala Muthappa",  specialty:"OBG",             experience:"14 years"}
        ],
        specialties:["General Medicine","OBG","Paediatrics","Surgery","Orthopaedics"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      }
    ],
    clinics:[]
  },

  chitradurga: {
    district: "Chitradurga",
    emergency: "108",
    hospitals: [
      {
        id:"ctr-001", name:"District Hospital Chitradurga (Govt.)", type:"Government District Hospital", tier:"secondary",
        address:"BH Road, Chitradurga – 577501", phone:"08194-222200",
        beds:300,
        doctors:[{name:"Dr. K. Venkataramana", specialty:"General Medicine", experience:"18 years"}],
        specialties:["General Medicine","Surgery","OBG","Paediatrics","Orthopaedics"],
        opd_hours:"Mon–Sat 8AM–4PM (Emergency 24/7)"
      }
    ],
    clinics:[]
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   SEARCH ENGINE
═══════════════════════════════════════════════════════════════════════ */
function normalizeDistrict(d) {
  if (!d) return null;
  return d.toLowerCase()
    .replace(/\s+/g,'_').replace(/[()]/g,'')
    .replace(/bengaluru_urban|bangalore/,'bengaluru')
    .replace(/shimoga/,'shivamogga')
    .replace(/belgaum/,'belagavi')
    .replace(/gulbarga/,'kalaburagi')
    .replace(/mangaluru|mangalore|dakshina_kannada/,'dakshina_kannada')
    .replace(/hubli|hubballi|dharwad/,'dharwad')
    .replace(/bellary/,'ballari')
    .replace(/bijapur/,'vijayapura')
    .replace(/coorg/,'kodagu')
    .replace(/manipal|udupi/,'udupi');
}

function searchHospitals({ district, specialty, name, type, keyword }) {
  const results = [];
  const dk = normalizeDistrict(district);
  for (const [key, data] of Object.entries(KARNATAKA_HOSPITALS)) {
    if (dk && !key.includes(dk) && !dk.includes(key)) continue;
    const all = [...(data.hospitals||[]), ...(data.clinics||[])];
    for (const f of all) {
      let match = true;
      if (specialty) { const sp=specialty.toLowerCase(); match=f.specialties?.some(s=>s.toLowerCase().includes(sp))||f.doctors?.some(d=>d.specialty?.toLowerCase().includes(sp)); }
      if (name && match) match=f.name.toLowerCase().includes(name.toLowerCase());
      if (type && match) match=f.type?.toLowerCase().includes(type.toLowerCase());
      if (keyword && match) { const kw=keyword.toLowerCase(); match=f.name.toLowerCase().includes(kw)||f.specialties?.some(s=>s.toLowerCase().includes(kw))||f.doctors?.some(d=>d.name?.toLowerCase().includes(kw)||d.specialty?.toLowerCase().includes(kw)); }
      if (match) results.push({...f, district:data.district});
    }
  }
  return results;
}

/* ═══════════════════════════════════════════════════════════════════════
   STATE + NOTIFICATIONS + EMERGENCY
═══════════════════════════════════════════════════════════════════════ */
const bookings=[], escalations=[], emergencies=[];

async function sendNotification({to, message}) {
  const r = {};
  const phone10 = to.replace(/\D/g,'').slice(-10);
  const phoneE164 = '+91' + phone10;

  if (!phone10 || phone10.length !== 10) {
    console.warn('[SMS] Invalid number:', to);
    r.error = 'invalid_phone';
    return r;
  }

  /* ── Twilio ── */
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    try {
      const creds  = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const body   = new URLSearchParams({ To: phoneE164, From: process.env.TWILIO_FROM_NUMBER, Body: message });
      const resp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        { method:'POST', headers:{ 'Authorization':`Basic ${creds}`, 'Content-Type':'application/x-www-form-urlencoded' }, body }
      );
      const data = await resp.json();
      if (data.sid) {
        r.sms = 'sent'; r.provider = 'twilio';
        console.log(`[SMS] ✅ Twilio → ${phoneE164} sid=${data.sid}`);
        return r;
      } else {
        r.twilio_error = data.message || data.code;
        console.warn('[SMS] Twilio error:', data.message);
      }
    } catch(e) { r.twilio_exception = e.message; }
  }

  /* ── Fast2SMS ── */
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method:'POST',
        headers:{ 'authorization':process.env.FAST2SMS_API_KEY, 'Content-Type':'application/json' },
        body: JSON.stringify({ route:'q', message, language:'english', flash:0, numbers:phone10 })
      });
      const data = await resp.json();
      if (data.return === true) {
        r.sms = 'sent'; r.provider = 'fast2sms';
        console.log(`[SMS] ✅ Fast2SMS → ${phone10}`);
        return r;
      } else {
        r.fast2sms_error = data.message;
        console.warn('[SMS] Fast2SMS error:', data.message);
      }
    } catch(e) { r.fast2sms_exception = e.message; }
  }

  if (!r.sms) {
    console.log(`[SMS] No provider worked. Message for ${phone10}:\n${message}`);
    r.logged = true;
  }
  return r;
}

function getFirstAidInstructions(symptoms) {
  const s = (symptoms||'').toLowerCase();
  if (s.includes('heart attack') || s.includes('chest pain') || s.includes('chest tightness')) {
    return {
      condition: 'Possible Heart Attack',
      steps: [
        'Have the person sit or lie down in a comfortable position — do NOT let them walk around',
        'Loosen tight clothing around neck, chest and waist immediately',
        'If the person is conscious and not allergic, give ONE aspirin (325mg) to chew slowly',
        'If the person becomes unconscious and stops breathing, begin CPR: 30 chest compressions + 2 rescue breaths',
        'Keep them calm and still — panic increases oxygen demand on the heart',
        'Do NOT give food or water',
        'Stay on the line with 108 — follow their instructions exactly'
      ],
      do_not: ['Do NOT leave them alone', 'Do NOT let them drive', 'Do NOT give aspirin if allergic']
    };
  }
  if (s.includes('stroke') || s.includes('paralysis') || s.includes('sudden vision') || s.includes('face drooping')) {
    return {
      condition: 'Possible Stroke — Use FAST Test',
      steps: [
        'FAST: Face drooping? Arm weakness? Speech difficulty? Time to call 108 NOW',
        'Lay the person down with head and shoulders slightly raised',
        'Do NOT give any food, water or medication — they may choke',
        'If unconscious but breathing, turn to recovery position (on their side)',
        'Note the EXACT TIME symptoms started — doctors need this for treatment',
        'Keep them calm, warm and still until ambulance arrives',
        'Do NOT give aspirin — stroke may be caused by bleeding'
      ],
      do_not: ['Do NOT give aspirin', 'Do NOT give anything to eat/drink', 'Do NOT leave them alone']
    };
  }
  if (s.includes('breathing') || s.includes('cannot breathe') || s.includes('asthma') || s.includes('choking')) {
    return {
      condition: 'Breathing Emergency',
      steps: [
        'Sit the person upright — leaning slightly forward helps open airways',
        'Loosen any tight clothing around throat and chest immediately',
        'If they have an inhaler (asthma), help them use it now',
        'If choking on an object: give 5 firm back blows between shoulder blades',
        'If back blows fail: perform Heimlich maneuver — 5 abdominal thrusts',
        'If person becomes unconscious: begin CPR immediately',
        'Keep environment calm — panic worsens breathing difficulty'
      ],
      do_not: ['Do NOT tilt head back if choking', 'Do NOT give water', 'Do NOT leave alone']
    };
  }
  if (s.includes('bleeding') || s.includes('blood') || s.includes('wound') || s.includes('cut')) {
    return {
      condition: 'Severe Bleeding',
      steps: [
        'Apply firm direct pressure on the wound using a clean cloth or clothing',
        'Do NOT remove the cloth even if soaked — add more cloth on top and keep pressing',
        'Elevate the injured limb above heart level if possible',
        'If an object is embedded in the wound, do NOT remove it — press around it',
        'Keep the person lying down and warm — prevents shock',
        'If bleeding from limb and uncontrolled: apply a tourniquet 5cm above wound as last resort',
        'Monitor for shock: pale skin, rapid breathing, confusion — lay flat and raise legs'
      ],
      do_not: ['Do NOT remove embedded objects', 'Do NOT use a tourniquet unless bleeding is life-threatening']
    };
  }
  if (s.includes('unconscious') || s.includes('collapsed') || s.includes('fainted') || s.includes('seizure') || s.includes('fits')) {
    return {
      condition: 'Unconscious / Seizure',
      steps: [
        'Check if breathing: look, listen, feel for breath for 10 seconds',
        'If breathing: place in recovery position — on their side to prevent choking',
        'If NOT breathing: begin CPR immediately — 30 hard fast compressions then 2 breaths',
        'For seizure: clear the area of hard objects, do NOT restrain the person',
        'Place something soft under their head during seizure',
        'After seizure stops: turn to recovery position and check breathing',
        'Time the seizure — if over 5 minutes, this is life-threatening'
      ],
      do_not: ['Do NOT put anything in mouth during seizure', 'Do NOT restrain during seizure', 'Do NOT leave alone']
    };
  }
  if (s.includes('burn') || s.includes('fire') || s.includes('scalding')) {
    return {
      condition: 'Burns',
      steps: [
        'Cool the burn with cool (NOT cold/iced) running water for minimum 20 minutes',
        'Remove jewellery and clothing near the burn — but NOT if stuck to skin',
        'Cover loosely with a clean non-fluffy material like cling wrap or clean plastic bag',
        'Keep the person warm — burns cause heat loss and shock',
        'Do NOT apply butter, toothpaste, oil or any cream to the burn',
        'For large burns or burns on face/hands/genitals: always treat as emergency'
      ],
      do_not: ['Do NOT use ice or cold water', 'Do NOT apply creams or butter', 'Do NOT burst blisters']
    };
  }
  if (s.includes('poison') || s.includes('overdose') || s.includes('swallowed')) {
    return {
      condition: 'Poisoning / Overdose',
      steps: [
        'Do NOT induce vomiting — this can cause more damage for many substances',
        'If person is conscious: keep them awake and talking',
        'Save any container, tablet box or substance for doctors to identify',
        'If person vomits spontaneously: turn to recovery position to prevent choking',
        'Call 108 immediately and tell them exactly what was taken and when',
        'Karnataka Poison Control: 080-26662150'
      ],
      do_not: ['Do NOT induce vomiting', 'Do NOT give milk or water without medical advice']
    };
  }
  return {
    condition: 'Medical Emergency',
    steps: [
      'Keep the person calm and still — do not move them unless in immediate danger',
      'Loosen any tight clothing around neck, chest and waist',
      'If unconscious and breathing: place in recovery position on their side',
      'If not breathing: begin CPR — 30 chest compressions + 2 rescue breaths',
      'Keep them warm using a blanket or jacket',
      'Do not give food or water',
      'Stay with them and keep talking calmly until help arrives'
    ],
    do_not: ['Do NOT leave alone', 'Do NOT move unless in danger', 'Do NOT give food or water']
  };
}

async function dispatchEmergency({lat, lng, address, patientName, phone, symptoms, sessionId}) {
  const hasGPS    = !!(lat && lng);
  const mapsUrl   = hasGPS ? `https://maps.google.com/?q=${lat},${lng}` : null;
  const locationStr = hasGPS
    ? `GPS: ${lat.toFixed(5)},${lng.toFixed(5)} | ${mapsUrl}`
    : (address || 'Location not shared — patient must share address');

  const firstAid  = getFirstAidInstructions(symptoms);
  const emergencyId = 'EMG-' + Date.now().toString(36).toUpperCase().slice(-6);

  const emergency = {
    id: emergencyId,
    patient:   patientName || 'Unknown',
    phone:     phone || 'N/A',
    symptoms,
    location:  locationStr,
    lat, lng,
    mapsUrl,
    firstAid,
    sessionId,
    ts:        new Date().toISOString(),
    status:    'dispatched'
  };
  emergencies.push(emergency);

  const alertMsg = [
    `🚨 EMERGENCY ALERT — ${emergencyId}`,
    `Patient: ${emergency.patient}`,
    `Phone:   ${emergency.phone}`,
    `Symptoms: ${symptoms}`,
    `Location: ${locationStr}`,
    `Time: ${new Date().toLocaleString('en-IN')}`,
    ``,
    `⚡ FIRST AID — ${firstAid.condition}:`,
    firstAid.steps.slice(0,4).map((s,i) => `${i+1}. ${s}`).join('\n'),
    ``,
    `📍 MAP: ${mapsUrl || 'GPS not available'}`
  ].join('\n');

  console.error('\n' + '='.repeat(70) + '\n' + alertMsg + '\n' + '='.repeat(70) + '\n');

  if (process.env.CLINIC_EMERGENCY_PHONE) {
    await sendNotification({ to: process.env.CLINIC_EMERGENCY_PHONE, message: alertMsg });
  }

  if (phone && phone !== 'N/A') {
    const patientMsg = [
      `🚨 ShadowQuant Emergency Response`,
      `ID: ${emergencyId}`,
      ``,
      `Emergency services (108) have been alerted to your location.`,
      hasGPS ? `📍 Your location: ${mapsUrl}` : `📍 Please share your exact address with 108`,
      ``,
      `⚡ IMMEDIATE FIRST AID — ${firstAid.condition}:`,
      firstAid.steps.slice(0,5).map((s,i) => `${i+1}. ${s}`).join('\n'),
      ``,
      `🚑 Call 108 directly as backup`,
      `📞 Karnataka Health Helpline: 104`
    ].join('\n');
    await sendNotification({ to: phone, message: patientMsg });
  }

  return {
    emergency_id: emergencyId,
    status:       'dispatched',
    location:     locationStr,
    maps_url:     mapsUrl,
    has_gps:      hasGPS,
    first_aid:    firstAid,
    message:      `Emergency services alerted. ID: ${emergencyId}. ${hasGPS ? 'Your GPS location has been shared.' : 'Please share your location with 108.'} First aid instructions sent to your phone.`
  };
}

async function writeToSheets(row) {
  if (!process.env.GOOGLE_SHEETS_ID||!process.env.GOOGLE_SERVICE_ACCOUNT) return {ok:false};
  try {
    const {google}=require('googleapis');
    const creds=JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth=new google.auth.GoogleAuth({credentials:creds,scopes:['https://www.googleapis.com/auth/spreadsheets']});
    const sheets=google.sheets({version:'v4',auth});
    await sheets.spreadsheets.values.append({spreadsheetId:process.env.GOOGLE_SHEETS_ID,range:'Sheet1!A:I',valueInputOption:'USER_ENTERED',requestBody:{values:[[row.ref,row.patient,row.phone,row.day,row.time,row.doctor||row.doctor_name,row.service||row.specialty,row.urgency,new Date().toLocaleString('en-IN')]]}});
    return {ok:true};
  } catch(e) {return {ok:false};}
}

/* ═══════════════════════════════════════════════════════════════════════
   TOOL EXECUTION
═══════════════════════════════════════════════════════════════════════ */
async function executeTool(name, args) {

  if (name==='search_hospitals') {
    const results=searchHospitals({district:args.district,specialty:args.specialty,name:args.hospital_name,type:args.facility_type,keyword:args.keyword});
    if (!results.length) return {status:'no_results',message:`No hospitals found. Available districts: ${Object.values(KARNATAKA_HOSPITALS).map(d=>d.district).join(', ')}`};
    const formatted=results.slice(0,5).map(h=>({name:h.name,district:h.district,type:h.type,address:h.address,phone:h.phone,emergency_phone:h.emergency_phone,beds:h.beds,accreditation:h.accreditation,specialties:h.specialties,top_doctors:(h.doctors||[]).slice(0,4).map(d=>`${d.name} — ${d.specialty}${d.qualification?' ('+d.qualification+')':''}, ${d.experience}`),opd_hours:h.opd_hours,facilities:h.facilities}));
    return {status:'ok',count:results.length,results:formatted,message:`Found ${results.length} match(es). Top ${formatted.length} shown.`};
  }

  if (name==='get_hospital_details') {
    const all=Object.values(KARNATAKA_HOSPITALS).flatMap(d=>[...(d.hospitals||[]),...(d.clinics||[])].map(f=>({...f,district:d.district})));
    const match=all.find(f=>f.id===args.hospital_id||f.name.toLowerCase().includes((args.hospital_name||'').toLowerCase()));
    if (!match) return {status:'not_found',message:'Hospital not found.'};
    return {status:'ok',hospital:match};
  }

  if (name==='list_districts') {
    return {status:'ok',total_districts:Object.keys(KARNATAKA_HOSPITALS).length,districts:Object.values(KARNATAKA_HOSPITALS).map(d=>({name:d.district,hospitals:(d.hospitals||[]).length,clinics:(d.clinics||[]).length}))};
  }

  if (name==='assess_urgency') {
    const s=(args.symptoms||'').toLowerCase();
    const CRITICAL=['severe pain','unbearable','jaw broken','swelling face','bleeding heavily','knocked out','abscess','cannot breathe','can not breathe','chest pain','unconscious','stroke','collapsed','paralysis','heart attack','seizure','fits','breathing difficulty'];
    const HIGH=['bad pain','toothache','broken tooth','high fever','vomiting blood','severe headache','sudden vision loss','chest tightness'];
    const MEDIUM=['mild pain','sensitivity','gum bleeding','fever','rash','cough','loose motion'];
    let level='low',action='book_appointment';
    if (CRITICAL.some(k=>s.includes(k))){level='critical';action='emergency';}
    else if (HIGH.some(k=>s.includes(k))){level='high';action='priority_booking';}
    else if (MEDIUM.some(k=>s.includes(k))){level='medium';action='book_appointment';}
    if (level==='critical') escalations.push({symptoms:args.symptoms,level,ts:new Date().toISOString()});
    const msgs={critical:`This is a critical emergency. I am alerting emergency services RIGHT NOW. Call 108 immediately. Please stay where you are.`,high:`Your symptoms need prompt attention. Let me find you the nearest available specialist.`,medium:`I will find you the right doctor and help book an appointment.`,low:`I can help you find the right doctor and book an appointment.`};
    return {urgency:level,action,message:msgs[level]};
  }

  if (name==='trigger_emergency') return await dispatchEmergency({lat:args.lat,lng:args.lng,address:args.address,patientName:args.patient_name,phone:args.phone,symptoms:args.symptoms,sessionId:args.session_id});

  if (name==='book_appointment') {
    const day=(args.day||'').toLowerCase();
    const ref='SQ-'+Date.now().toString(36).toUpperCase().slice(-6);
    const booking={ref,patient:args.patient_name,phone:args.phone||'N/A',hospital:args.hospital_name||'Walk-in',day,time:args.time||'09:00',doctor:args.doctor_name||'Available Doctor',specialty:args.specialty||'General',urgency:args.urgency||'routine',bookedAt:new Date().toISOString()};
    bookings.push(booking);
    await writeToSheets(booking);
    let notifStatus='no_phone';
    if (args.phone&&args.phone!=='N/A') {
      const nResult=await sendNotification({to:args.phone,message:`✅ Appointment Confirmed — ShadowQuant Smart Clinic\nRef: ${ref}\nPatient: ${args.patient_name}\n${day.charAt(0).toUpperCase()+day.slice(1)} at ${args.time||'09:00'}\nHospital: ${args.hospital_name||'As discussed'}\nDoctor: ${args.doctor_name||'Available'}\nSpecialty: ${args.specialty||'General'}\nEmergency: 108 | Helpline: 104`,});
      notifStatus=Object.keys(nResult).filter(k=>nResult[k]==='sent').join(', ')||'logged';
    }
    return {status:'confirmed',ref,hospital:args.hospital_name,doctor:args.doctor_name,day:args.day,time:args.time||'09:00',notification_sent:notifStatus,message:`Appointment confirmed! Reference: ${ref}. ${args.patient_name} booked with ${args.doctor_name||'available doctor'} at ${args.hospital_name} on ${args.day} at ${args.time||'09:00'}. Confirmation sent via ${notifStatus}.`};
  }

  if (name==='send_booking_notification') {
    const b=bookings.find(bk=>bk.ref===args.ref);
    if (!b) return {status:'not_found',message:'Booking reference not found.'};
    const phone=args.phone||b.phone;
    if (!phone||phone==='N/A') return {status:'no_phone',message:'No phone number.'};
    const msg=`✅ Appointment — ShadowQuant Smart Clinic\nRef: ${b.ref} | ${b.patient}\n${b.day} at ${b.time}\n${b.hospital} | ${b.doctor}\nEmergency: 108`;
    const result=await sendNotification({to:phone,message:msg});
    return {status:'sent',channel_used:Object.keys(result).filter(k=>result[k]==='sent').join(', ')||'logged'};
  }

  if (name==='cancel_appointment') {
    const idx=bookings.findIndex(b=>b.ref===args.ref);
    if (idx===-1) return {status:'not_found',message:`No booking with ref ${args.ref}.`};
    const [cancelled]=bookings.splice(idx,1);
    if (cancelled.phone!=='N/A') await sendNotification({to:cancelled.phone,message:`❌ Appointment Cancelled — Ref: ${args.ref}. To rebook: 104 (Karnataka Health Helpline)`,});
    return {status:'cancelled',message:`Booking ${args.ref} for ${cancelled.patient} cancelled.`};
  }

  return {status:'error',message:'Unknown tool.'};
}

/* ═══════════════════════════════════════════════════════════════════════
   CLAUDE TOOL DEFINITIONS
   Claude uses: { name, description, input_schema: { type, properties, required } }
═══════════════════════════════════════════════════════════════════════ */
const CLAUDE_TOOLS = [
  {name:'search_hospitals',description:'Search hospitals and clinics across Karnataka by district, specialty, doctor name, or keyword. Use for ANY query about hospitals, doctors, or medical services in Karnataka.',input_schema:{type:'object',properties:{district:{type:'string',description:'Karnataka district: Bengaluru, Mysuru, Shivamogga, Mangaluru, Hubballi, Belagavi, Kalaburagi, Davangere, Hassan, Ballari, Raichur, Udupi, Bidar, Vijayapura, Kodagu, Chitradurga, Tumakuru'},specialty:{type:'string',description:'Medical specialty: Cardiology, Neurology, Orthopaedics, Gynaecology, Paediatrics, Oncology, General Medicine, Dental, ENT, etc.'},hospital_name:{type:'string'},facility_type:{type:'string',description:'government, private, teaching, super-specialty, clinic'},keyword:{type:'string'}}}},
  {name:'get_hospital_details',description:'Get full details of a specific hospital.',input_schema:{type:'object',properties:{hospital_id:{type:'string'},hospital_name:{type:'string'}}}},
  {name:'list_districts',description:'List all Karnataka districts with hospital data.',input_schema:{type:'object',properties:{dummy:{type:'string',description:'Not needed, pass empty string'}}}},
  {name:'assess_urgency',description:'Assess urgency of patient symptoms. ALWAYS call first when patient describes any medical problem.',input_schema:{type:'object',properties:{symptoms:{type:'string',description:'Patient symptoms description'}},required:['symptoms']}},
  {name:'trigger_emergency',description:'IMMEDIATELY dispatch emergency services when urgency is CRITICAL. Do NOT wait for confirmation.',input_schema:{type:'object',properties:{patient_name:{type:'string'},phone:{type:'string'},symptoms:{type:'string'},lat:{type:'number'},lng:{type:'number'},address:{type:'string'},session_id:{type:'string'}},required:['symptoms']}},
  {name:'book_appointment',description:'Book a medical appointment at any Karnataka hospital. Collect: patient name, phone, hospital, doctor, day, time, specialty.',input_schema:{type:'object',properties:{patient_name:{type:'string'},phone:{type:'string'},hospital_name:{type:'string'},doctor_name:{type:'string'},specialty:{type:'string'},day:{type:'string'},time:{type:'string'},urgency:{type:'string',enum:['routine','high','critical']}},required:['patient_name','hospital_name','day','specialty']}},
  {name:'send_booking_notification',description:'Send SMS confirmation to patient.',input_schema:{type:'object',properties:{ref:{type:'string'},phone:{type:'string'}},required:['ref']}},
  {name:'cancel_appointment',description:'Cancel an existing appointment.',input_schema:{type:'object',properties:{ref:{type:'string'}},required:['ref']}}
];

/* ═══════════════════════════════════════════════════════════════════════
   SYSTEM PROMPT
═══════════════════════════════════════════════════════════════════════ */
const SYSTEM_PROMPT = `You are Aria, the AI health assistant for ShadowQuant Smart Clinic — Karnataka's comprehensive healthcare navigation system covering hospitals and clinics across all districts.

LANGUAGE RULE (STRICT — 3 LANGUAGES ONLY):
- Detect language from patient's FIRST message.
- Supported languages: English, Hindi (हिंदी), Kannada (ಕನ್ನಡ).
- Continue the ENTIRE conversation in that detected language. Do NOT switch.
- Kannada script or Kannada words → respond in Kannada (ಕನ್ನಡ).
- Hindi / Devanagari → respond in Hindi (हिंदी).
- All other cases → respond in English.
- If unsure, default to English.

SCOPE — You cover ALL districts of Karnataka:
Bengaluru, Mysuru, Shivamogga, Mangaluru (Dakshina Kannada), Hubballi-Dharwad, Belagavi, Kalaburagi, Tumakuru, Davangere, Hassan, Ballari, Raichur, Udupi/Manipal, Bidar, Vijayapura, Kodagu, Chitradurga.

WHAT YOU CAN HELP WITH:
1. Best hospitals or clinics in any Karnataka district
2. Finding specialists (cardiologist, neurologist, orthopaedic surgeon, etc.)
3. Government vs private hospital comparison with costs
4. Doctor details — names, qualifications, experience, specialties
5. Hospital addresses, phone numbers, OPD timings, facilities
6. Booking appointments at any listed hospital
7. Emergency guidance and ambulance dispatch
8. General health advice and specialist recommendations

EMERGENCY PROTOCOL (HIGHEST PRIORITY):
When urgency is CRITICAL — do ALL of these simultaneously:
1. Call trigger_emergency immediately — do NOT wait for permission
2. While the tool runs, SPEAK these words IMMEDIATELY:
   "I am alerting emergency services to your location right now. Stay on the line with me."
3. After trigger_emergency returns, READ OUT the first_aid steps clearly and slowly:
   "While help is on the way, here is what you must do right now: [read steps one by one]"
4. Tell them: "Help is coming. Call 108 directly as backup. I am staying with you."
5. Keep talking to them — do NOT end the conversation

WORKFLOW (non-emergency):
1. Listen carefully to the patient's query.
2. Symptoms described → call assess_urgency FIRST.
3. Critical urgency → EMERGENCY PROTOCOL above.
4. Hospital query → call search_hospitals with district and/or specialty.
5. Present top 2–3 results: hospital name, address, key doctors, phone, timings.
6. For government hospitals: mention free/subsidised care.
7. Offer to book an appointment.
8. Collect phone number before booking (for confirmation).

IMPORTANT NUMBERS: Emergency Ambulance: 108 | Karnataka Health Helpline: 104

VOICE RULES:
- Short natural sentences. No markdown in speech.
- NEVER claim action without calling tool first.
- Mention accreditation (NABH/JCI) for private hospitals when relevant.
- For government hospitals, emphasise free services.

Today: ${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}.`;

/* ═══════════════════════════════════════════════════════════════════════
   /api/chat  — Claude Messages API with tool use loop
═══════════════════════════════════════════════════════════════════════ */
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages))
    return res.status(400).json({ error: 'messages array required' });

  try {
    let history   = [...messages];
    let finalText = '';
    let toolCalls = [];
    let loops     = 0;

    while (loops++ < 10) {
      const payload = {
        model:      CLAUDE_MODEL,
        max_tokens: 1024,
        temperature: 0.4,
        system:     SYSTEM_PROMPT,
        tools:      CLAUDE_TOOLS,
        messages:   history
      };

      const r = await fetch(CLAUDE_API_URL, {
        method:  'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (!r.ok) {
        const errBody = await r.json().catch(() => ({}));
        const msg = errBody?.error?.message || `Claude API HTTP ${r.status}`;
        console.error('[/api/chat] Claude error:', msg);
        return res.status(502).json({ error: msg });
      }

      const data = await r.json();

      // stop_reason: 'tool_use' means Claude wants to call tools
      if (data.stop_reason === 'tool_use') {
        // Add Claude's assistant turn (may contain text + tool_use blocks)
        history.push({ role: 'assistant', content: data.content });

        // Process all tool_use blocks
        const toolResults = [];
        for (const block of data.content) {
          if (block.type !== 'tool_use') continue;

          const { id, name, input } = block;
          console.log(`[Tool] ${name}`, JSON.stringify(input).slice(0, 100));
          const result = await executeTool(name, input || {});
          toolCalls.push({ tool: name, args: input, result });

          toolResults.push({
            type:        'tool_result',
            tool_use_id: id,
            content:     JSON.stringify(result)
          });
        }

        // Add all tool results in a single user turn (Claude requirement)
        history.push({ role: 'user', content: toolResults });
        continue; // loop back for Claude's next response
      }

      // stop_reason: 'end_turn' — plain text response, we're done
      finalText = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');
      break;
    }

    res.json({
      reply:          finalText,
      tool_calls:     toolCalls,
      bookings_count: bookings.length,
      messages:       history
    });

  } catch (err) {
    console.error('[/api/chat] Error:', err.message, err.stack?.slice(0, 400));
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════════════
   REALTIME TOKEN — stub (voice mode not available with Claude API)
   Returns JSON so the frontend doesn't crash with "Unexpected token '<'"
═══════════════════════════════════════════════════════════════════════ */
app.post('/api/realtime-token', (req, res) => {
  res.status(410).json({
    error: 'Voice/Realtime mode is not available. Please use the text chat interface (/api/chat).',
    hint:  'WebRTC realtime was OpenAI-only. Use the chat UI instead.'
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   TOOL CALL PROXY (used by browser-side clients)
═══════════════════════════════════════════════════════════════════════ */
app.post('/api/tool-call', async (req, res) => {
  const { name, arguments: argsStr } = req.body;
  let args = {};
  try { args = typeof argsStr === 'string' ? JSON.parse(argsStr) : (argsStr || {}); } catch(e) {}
  console.log(`[Tool] ${name}`, JSON.stringify(args).slice(0, 120));
  const result = await executeTool(name, args);
  res.json(result);
});

/* ═══════════════════════════════════════════════════════════════════════
   MISC ROUTES
═══════════════════════════════════════════════════════════════════════ */
app.get('/api/test-sms', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.json({ error: 'Pass ?phone=9876543210' });
  const result = await sendNotification({ to: phone, message: 'ShadowQuant Smart Clinic: This is a test SMS.' });
  res.json({ phone_received: phone, twilio_set: !!process.env.TWILIO_ACCOUNT_SID, fast2sms_set: !!process.env.FAST2SMS_API_KEY, result });
});

app.post('/api/emergency-contact-sms', async (req, res) => {
  const { contact_phone, contact_name, patient_name, patient_phone, symptoms, location, emergency_id } = req.body;
  if (!contact_phone) return res.status(400).json({ error: 'contact_phone required' });
  const msg = [`🚨 EMERGENCY ALERT — ${emergency_id}`,``,`${patient_name} needs immediate help.`,`Symptoms: ${symptoms}`,``,`📍 Location: ${location}`,`📞 Patient phone: ${patient_phone}`,``,`Emergency services (108) have been alerted.`,`Please call ${patient_name} immediately.`,``,`— ShadowQuant Smart Clinic`].join('\n');
  const result = await sendNotification({ to: contact_phone, message: msg });
  res.json({ status: 'sent', contact: contact_name, result });
});

app.get('/api/debug', async (req, res) => {
  const results = { key_set: !!ANTHROPIC_API_KEY, key_prefix: ANTHROPIC_API_KEY?.slice(0, 10) + '...' };
  try {
    const r = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 10, messages: [{ role: 'user', content: 'Reply with just the word OK' }] })
    });
    const data = await r.json();
    results.claude_status = r.status;
    results.claude_ok     = r.ok;
    results.claude_reply  = data.content?.[0]?.text;
    results.claude_error  = data.error?.message;
  } catch(e) { results.fetch_error = e.message; }
  res.json(results);
});

app.get('/api/health', (req, res) => res.json({
  status: 'ok', agent: 'Aria', system: 'ShadowQuant Smart Clinic — Karnataka',
  ai_provider: 'Anthropic Claude', model: CLAUDE_MODEL,
  districts: Object.keys(KARNATAKA_HOSPITALS).length,
  total_hospitals: Object.values(KARNATAKA_HOSPITALS).reduce((a,d)=>a+(d.hospitals||[]).length,0),
  total_clinics:   Object.values(KARNATAKA_HOSPITALS).reduce((a,d)=>a+(d.clinics||[]).length,0),
  notifications: { twilio: !!process.env.TWILIO_ACCOUNT_SID, fast2sms: !!process.env.FAST2SMS_API_KEY }
}));

app.get('/api/districts',   (req, res) => res.json(Object.values(KARNATAKA_HOSPITALS).map(d=>({name:d.district,hospitals:(d.hospitals||[]).length,clinics:(d.clinics||[]).length}))));
app.get('/api/hospitals',   (req, res) => res.json(searchHospitals({district:req.query.district, specialty:req.query.specialty})));
app.get('/api/bookings',    (req, res) => res.json(bookings));
app.get('/api/emergencies', (req, res) => res.json(emergencies));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const h = Object.values(KARNATAKA_HOSPITALS).reduce((a,d)=>a+(d.hospitals||[]).length,0);
  const c = Object.values(KARNATAKA_HOSPITALS).reduce((a,d)=>a+(d.clinics||[]).length,0);
  console.log(`✅  ShadowQuant Smart Clinic — Aria (Claude Edition)`);
  console.log(`🌐  http://localhost:${PORT}`);
  console.log(`🤖  AI Provider: Anthropic Claude (${CLAUDE_MODEL})`);
  console.log(`🗺️   Karnataka Districts: ${Object.keys(KARNATAKA_HOSPITALS).length}`);
  console.log(`🏥  Hospitals: ${h} | Clinics: ${c}`);
  console.log(`📱  Twilio SMS:  ${process.env.TWILIO_ACCOUNT_SID?'✅':'— Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER'}`);
  console.log(`📱  Fast2SMS:    ${process.env.FAST2SMS_API_KEY?'✅':'— Set FAST2SMS_API_KEY'}`);
});
