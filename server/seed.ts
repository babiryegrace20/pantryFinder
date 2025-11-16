import { db } from "./db";
import { users, pantries, inventoryItems, addresses } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const [individual] = await db.insert(users).values({
    email: "user@example.com",
    name: "Jane Doe",
    role: "individual",
    familySize: 4,
    dietaryRestrictions: ["Vegetarian"],
  }).returning();

  const [pantryAdmin] = await db.insert(users).values({
    email: "pantry@example.com",
    name: "John Smith",
    role: "pantry-admin",
  }).returning();

  const [admin] = await db.insert(users).values({
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  }).returning();

  console.log("Created users");

  const pantryData = [
    {
      name: "Los Angeles Community Food Bank",
      street: "1734 East 41st Street",
      city: "Los Angeles",
      state: "CA",
      zip: "90058",
      lat: 34.0078,
      lon: -118.2340,
      hours: {
        "Monday": "8:00 AM - 8:00 PM",
        "Tuesday": "8:00 AM - 8:00 PM",
        "Wednesday": "8:00 AM - 8:00 PM",
        "Thursday": "8:00 AM - 8:00 PM",
        "Friday": "8:00 AM - 8:00 PM",
        "Saturday": "9:00 AM - 5:00 PM",
        "Sunday": "Closed",
      },
      contactEmail: "help@lacfb.org",
      contactPhone: "(323) 234-3030",
      serviceArea: ["90058", "90001", "90011"],
    },
    {
      name: "SF-Marin Food Bank",
      street: "900 Pennsylvania Avenue",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
      lat: 37.7599,
      lon: -122.3988,
      hours: {
        "Monday-Friday": "9:00 AM - 5:00 PM",
        "Saturday": "10:00 AM - 2:00 PM",
      },
      contactEmail: "info@sfmfoodbank.org",
      contactPhone: "(415) 282-1900",
      serviceArea: ["94107", "94110", "94124"],
    },
    {
      name: "Houston Food Bank",
      street: "535 Portwall Street",
      city: "Houston",
      state: "TX",
      zip: "77029",
      lat: 29.7372,
      lon: -95.2697,
      hours: {
        "Monday": "8:00 AM - 7:00 PM",
        "Tuesday": "8:00 AM - 7:00 PM",
        "Wednesday": "8:00 AM - 7:00 PM",
        "Thursday": "8:00 AM - 7:00 PM",
        "Friday": "8:00 AM - 5:00 PM",
        "Saturday": "8:00 AM - 12:00 PM",
      },
      contactEmail: "contact@houstonfoodbank.org",
      contactPhone: "(713) 547-8607",
      serviceArea: ["77029", "77020", "77026"],
    },
    {
      name: "Central Texas Food Bank",
      street: "6500 Metropolis Drive",
      city: "Austin",
      state: "TX",
      zip: "78744",
      lat: 30.2014,
      lon: -97.7539,
      hours: {
        "Monday-Friday": "8:00 AM - 9:00 PM",
        "Saturday-Sunday": "10:00 AM - 6:00 PM",
      },
      contactEmail: "info@centraltexasfoodbank.org",
      contactPhone: "(512) 282-2111",
      serviceArea: ["78744", "78745", "78748"],
    },
    {
      name: "Feeding South Florida",
      street: "4925 N. Dixie Highway",
      city: "Pompano Beach",
      state: "FL",
      zip: "33064",
      lat: 26.2540,
      lon: -80.1248,
      hours: {
        "Monday-Friday": "9:00 AM - 7:00 PM",
        "Saturday": "9:00 AM - 1:00 PM",
      },
      contactEmail: "help@feedingsouthflorida.org",
      contactPhone: "(954) 518-1818",
      serviceArea: ["33064", "33060", "33062"],
    },
    {
      name: "Feeding Tampa Bay",
      street: "4702 Transport Drive",
      city: "Tampa",
      state: "FL",
      zip: "33605",
      lat: 27.9795,
      lon: -82.4096,
      hours: {
        "Monday": "7:00 AM - 9:00 PM",
        "Tuesday": "7:00 AM - 9:00 PM",
        "Wednesday": "7:00 AM - 9:00 PM",
        "Thursday": "7:00 AM - 9:00 PM",
        "Friday": "7:00 AM - 6:00 PM",
        "Saturday": "8:00 AM - 4:00 PM",
      },
      contactEmail: "info@feedingtampabay.org",
      contactPhone: "(813) 254-1190",
      serviceArea: ["33605", "33610", "33612"],
    },
    {
      name: "City Harvest NYC",
      street: "150 52nd Street",
      city: "Brooklyn",
      state: "NY",
      zip: "11232",
      lat: 40.6534,
      lon: -74.0086,
      hours: {
        "Monday-Friday": "8:00 AM - 8:00 PM",
        "Saturday-Sunday": "9:00 AM - 5:00 PM",
      },
      contactEmail: "contact@cityharvest.org",
      contactPhone: "(646) 412-0600",
      serviceArea: ["11232", "11220", "11215"],
    },
    {
      name: "Food Bank For New York City",
      street: "39 Broadway",
      city: "New York",
      state: "NY",
      zip: "10006",
      lat: 40.7074,
      lon: -74.0124,
      hours: {
        "Monday-Saturday": "9:00 AM - 6:00 PM",
        "Sunday": "10:00 AM - 4:00 PM",
      },
      contactEmail: "info@foodbanknyc.org",
      contactPhone: "(212) 566-7855",
      serviceArea: ["10006", "10007", "10038"],
    },
    {
      name: "Greater Chicago Food Depository",
      street: "4100 West Ann Lurie Place",
      city: "Chicago",
      state: "IL",
      zip: "60632",
      lat: 41.8209,
      lon: -87.7269,
      hours: {
        "Monday-Friday": "8:30 AM - 7:30 PM",
        "Saturday": "9:00 AM - 1:00 PM",
      },
      contactEmail: "help@chicagosfoodbank.org",
      contactPhone: "(773) 247-3663",
      serviceArea: ["60632", "60629", "60609"],
    },
    {
      name: "Philabundance",
      street: "3616 S. Galloway Street",
      city: "Philadelphia",
      state: "PA",
      zip: "19148",
      lat: 39.9101,
      lon: -75.1450,
      hours: {
        "Monday-Thursday": "8:00 AM - 8:00 PM",
        "Friday": "8:00 AM - 5:00 PM",
        "Saturday": "9:00 AM - 3:00 PM",
      },
      contactEmail: "info@philabundance.org",
      contactPhone: "(215) 339-0900",
      serviceArea: ["19148", "19145", "19147"],
    },
    {
      name: "St. Mary's Food Bank",
      street: "2831 N 31st Avenue",
      city: "Phoenix",
      state: "AZ",
      zip: "85009",
      lat: 33.4779,
      lon: -112.1237,
      hours: {
        "Monday-Friday": "7:00 AM - 9:00 PM",
        "Saturday": "8:00 AM - 5:00 PM",
        "Sunday": "Closed",
      },
      contactEmail: "contact@stmarysfoodbank.org",
      contactPhone: "(602) 242-3663",
      serviceArea: ["85009", "85007", "85003"],
    },
    {
      name: "Food Lifeline Seattle",
      street: "815 S 96th Street",
      city: "Seattle",
      state: "WA",
      zip: "98108",
      lat: 47.5174,
      lon: -122.3065,
      hours: {
        "Monday-Friday": "8:00 AM - 6:00 PM",
        "Saturday": "9:00 AM - 3:00 PM",
      },
      contactEmail: "help@foodlifeline.org",
      contactPhone: "(206) 545-6600",
      serviceArea: ["98108", "98106", "98118"],
    },
    {
      name: "Food Bank of the Rockies",
      street: "10700 East 45th Avenue",
      city: "Denver",
      state: "CO",
      zip: "80239",
      lat: 39.7793,
      lon: -104.8710,
      hours: {
        "Monday-Friday": "9:00 AM - 7:00 PM",
        "Saturday": "10:00 AM - 4:00 PM",
      },
      contactEmail: "info@foodbankrockies.org",
      contactPhone: "(303) 371-9250",
      serviceArea: ["80239", "80238", "80249"],
    },
    {
      name: "Atlanta Community Food Bank",
      street: "732 Joseph E. Lowery Blvd NW",
      city: "Atlanta",
      state: "GA",
      zip: "30318",
      lat: 33.7718,
      lon: -84.4229,
      hours: {
        "Monday-Friday": "8:00 AM - 8:00 PM",
        "Saturday": "9:00 AM - 5:00 PM",
        "Sunday": "10:00 AM - 2:00 PM",
      },
      contactEmail: "contact@acfb.org",
      contactPhone: "(404) 892-9822",
      serviceArea: ["30318", "30314", "30310"],
    },
    {
      name: "Food Bank of Northwest Indiana",
      street: "3512 First Avenue",
      city: "Gary",
      state: "IN",
      zip: "46402",
      lat: 41.5933,
      lon: -87.3391,
      hours: {
        "Monday-Friday": "9:00 AM - 5:00 PM",
        "Saturday": "10:00 AM - 2:00 PM",
      },
      contactEmail: "help@foodbanknwi.org",
      contactPhone: "(219) 980-1770",
      serviceArea: ["46402", "46403", "46404"],
    },
    {
      name: "Community Harvest Food Bank",
      street: "4501 Grain Drive",
      city: "South Bend",
      state: "IN",
      zip: "46628",
      lat: 41.7045,
      lon: -86.2437,
      hours: {
        "Monday-Friday": "8:00 AM - 7:00 PM",
        "Saturday": "9:00 AM - 3:00 PM",
      },
      contactEmail: "contact@communityharvest.org",
      contactPhone: "(574) 232-9986",
      serviceArea: ["46628", "46617", "46619"],
    },
  ];

  const createdPantries = [];
  for (const data of pantryData) {
    const [pantry] = await db.insert(pantries).values({
      name: data.name,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      hours: data.hours as unknown as { [key: string]: string },
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      serviceArea: data.serviceArea,
      status: "active",
      managerId: pantryAdmin.id,
    }).returning();
    createdPantries.push(pantry);
  }

  console.log(`Created ${createdPantries.length} pantries`);

  const categories = [
    { 
      category: "Grains", 
      items: [
        { name: "White Rice", unit: "lbs" },
        { name: "Brown Rice", unit: "lbs" },
        { name: "Pasta", unit: "boxes" },
        { name: "Oatmeal", unit: "boxes" },
        { name: "Cereal", unit: "boxes" },
      ]
    },
    { 
      category: "Canned Goods", 
      items: [
        { name: "Tomato Soup", unit: "cans" },
        { name: "Green Beans", unit: "cans" },
        { name: "Corn", unit: "cans" },
        { name: "Chicken Noodle Soup", unit: "cans" },
        { name: "Black Beans", unit: "cans" },
        { name: "Tomato Sauce", unit: "cans" },
      ]
    },
    { 
      category: "Fresh Produce", 
      items: [
        { name: "Apples", unit: "lbs" },
        { name: "Bananas", unit: "lbs" },
        { name: "Carrots", unit: "lbs" },
        { name: "Lettuce", unit: "heads" },
        { name: "Potatoes", unit: "lbs" },
        { name: "Onions", unit: "lbs" },
      ]
    },
    { 
      category: "Dairy", 
      items: [
        { name: "Milk", unit: "gallons" },
        { name: "Cheese", unit: "lbs" },
        { name: "Yogurt", unit: "containers" },
        { name: "Butter", unit: "lbs" },
        { name: "Eggs", unit: "dozen" },
      ]
    },
    { 
      category: "Baby Formula", 
      items: [
        { name: "Infant Formula", unit: "containers" },
        { name: "Toddler Formula", unit: "containers" },
      ]
    },
    { 
      category: "Bread & Bakery", 
      items: [
        { name: "Whole Wheat Bread", unit: "loaves" },
        { name: "White Bread", unit: "loaves" },
        { name: "Dinner Rolls", unit: "packages" },
        { name: "Tortillas", unit: "packages" },
      ]
    },
    { 
      category: "Meat & Protein", 
      items: [
        { name: "Ground Beef", unit: "lbs" },
        { name: "Chicken Breast", unit: "lbs" },
        { name: "Canned Tuna", unit: "cans" },
        { name: "Peanut Butter", unit: "jars" },
        { name: "Beans (Dried)", unit: "lbs" },
      ]
    },
    { 
      category: "Frozen Items", 
      items: [
        { name: "Frozen Vegetables", unit: "bags" },
        { name: "Frozen Pizza", unit: "boxes" },
        { name: "Frozen Chicken", unit: "lbs" },
      ]
    },
    { 
      category: "Non-Food Items", 
      items: [
        { name: "Diapers (Size 4)", unit: "packages" },
        { name: "Toilet Paper", unit: "rolls" },
        { name: "Soap", unit: "bars" },
        { name: "Shampoo", unit: "bottles" },
        { name: "Toothpaste", unit: "tubes" },
      ]
    },
  ];

  for (const pantry of createdPantries) {
    for (const { category, items } of categories) {
      const numItems = Math.floor(Math.random() * items.length) + Math.min(2, items.length);
      const selectedItems = [...items].sort(() => Math.random() - 0.5).slice(0, numItems);

      for (const item of selectedItems) {
        const quantity = Math.floor(Math.random() * 150) + 20;
        const isSurplus = Math.random() > 0.7 ? 1 : 0;
        const hasExpiration = ["Fresh Produce", "Dairy", "Bread & Bakery", "Meat & Protein"].includes(category);
        
        let expirationDate = null;
        if (hasExpiration) {
          const daysAhead = Math.floor(Math.random() * 25) + 5;
          const date = new Date();
          date.setDate(date.getDate() + daysAhead);
          expirationDate = date.toISOString().split('T')[0];
        }

        await db.insert(inventoryItems).values({
          pantryId: pantry.id,
          category,
          name: item.name,
          quantity,
          unit: item.unit,
          expirationDate,
          status: "available",
          isSurplus,
        });
      }
    }
  }

  console.log("Created inventory items");

  await db.insert(addresses).values({
    userId: individual.id,
    street: "100 Center St",
    city: "South Bend",
    state: "IN",
    zip: "46601",
    lat: 41.6764,
    lon: -86.2520,
    isDefault: 1,
  });

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
