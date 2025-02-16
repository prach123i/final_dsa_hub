// import argon2 from "argon2";

// const testPassword = "plplpl"
// const hashedTestPassword = await argon2.hash(testPassword);
// console.log('Hashed Test Password:', hashedTestPassword);

// // Later, verify it
// const isMatch = await argon2.verify(hashedTestPassword, testPassword);
// console.log('Test Password Match Result:', isMatch); // Should log true

// // const enteredPassword = 'Prachu@12'; // The password entered by the user

// // bcrypt.hash(enteredPassword, 10, (err, hashedPassword) => {
// //   if (err) {
// //     console.error(err);
// //   } else {
// //     console.log('Hashed Password:', hashedPassword);
// //   }
// // });

// const plainPassword = "prachi123";
//   const hashedPassword = "$2a$10$faVFkZd35Yl/aO2WMsE0ruVzDMa/6EzbmOqcXD.f/VfNI6kOohLca"; // Example hash

//   const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
//   console.log("Password Match:", isMatch); // Should print true

// import argon2 from "argon2";

// async function testArgon2() {
//     const plainPassword = "123321";
//     const hashedPassword = await argon2.hash(plainPassword);
//     console.log("Hashed password:", hashedPassword);

//     const isMatch = await argon2.verify(hashedPassword, plainPassword);
//     console.log("Does it match?", isMatch);
// }

// testArgon2();
import argon2 from "argon2";

async function testHashing() {
  const password = "testPassword123"; // Try with a known password
  const hashedPassword = await argon2.hash(password);
  console.log("Hashed Password:", hashedPassword);

  const isMatch = await argon2.verify(hashedPassword, password);
  console.log("Password Match:", isMatch); // Should be true
}

testHashing();

document.querySelector("#signup").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const response = await fetch("/signup", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  alert(result.message);
  if (response.ok) {
    window.location.href = "/signin.html"; // Redirect to signin after signup
  }
});
