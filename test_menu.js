
(async () => {
  try {
    const res1 = await fetch("https://northsouthbackend.vercel.app/api/v1/menu/concerns");
    const { data: items } = await res1.json();
    console.log("--- INITIAL ---");
    items.forEach(i => console.log(`${i.sortOrder}: ${i.label} (${i._id})`));

    // Swap first and second
    const nextItems = [...items];
    const first = nextItems[0];
    const second = nextItems[1];
    nextItems[0] = { ...second, sortOrder: 1 };
    nextItems[1] = { ...first, sortOrder: 2 };

    console.log("\n--- PATCHING ---");
    const res2 = await fetch("https://northsouthbackend.vercel.app/api/v1/menu/concerns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: nextItems.map(i => ({ id: i._id, sortOrder: i.sortOrder }))
      })
    });
    const { data: patched } = await res2.json();
    
    console.log("--- AFTER PATCH ---");
    patched.forEach(i => console.log(`${i.sortOrder}: ${i.label} (${i._id})`));

    // GET again
    const res3 = await fetch("https://northsouthbackend.vercel.app/api/v1/menu/concerns");
    const { data: refreshed } = await res3.json();
    console.log("\n--- AFTER GET ---");
    refreshed.forEach(i => console.log(`${i.sortOrder}: ${i.label} (${i._id})`));

  } catch (err) {
    console.error(err.message);
  }
})();

