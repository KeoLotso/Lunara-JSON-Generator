let items = [];
let filesData = [];

fetch('files.json')
  .then(res => res.json())
  .then(data => {
    filesData = data;
    const select = document.getElementById("itemSelect");
    data.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      select.appendChild(option);
    });
  });

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.getElementById("addItem").addEventListener("click", () => {
  const itemID = document.getElementById("itemSelect").value;
  const count = parseInt(document.getElementById("count").value, 10);

  const randomHue = document.getElementById("randomHue").checked;
  const randomSaturation = document.getElementById("randomSaturation").checked;
  const randomSize = document.getElementById("randomSize").checked;

  for (let i = 0; i < count; i++) {
    const hue = randomHue ? getRandomInt(0, 255) : parseInt(document.getElementById("hue").value) || 0;
    const saturation = randomSaturation ? getRandomInt(0, 100) : parseInt(document.getElementById("saturation").value) || 0;
    const size = randomSize ? getRandomInt(-100, 100) : parseInt(document.getElementById("size").value) || 0;

    const newItem = {
      itemID,
      colorHue: hue,
      colorSaturation: saturation,
      scaleModifier: size
    };

    items.push(newItem);

    const li = document.createElement("li");
    const itemName = filesData.find(f => f.id === itemID)?.name || itemID;
    li.textContent = `${itemName} (Hue: ${hue}, Sat: ${saturation}, Size: ${size})`;
    document.getElementById("itemList").appendChild(li);
  }
});

document.getElementById("downloadJson").addEventListener("click", () => {
  const baseItem = {
    itemID: "item_backpack_large_base",
    children: items
  };

  const jsonOutput = {
    objects: [
      {
        collection: "user_inventory",
        key: "stash",
        permission_read: 1,
        permission_write: 1,
        value: JSON.stringify({
          version: 1,
          items: [baseItem]
        })
      }
    ]
  };

  const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "custom_inventory.json";
  link.click();
});
