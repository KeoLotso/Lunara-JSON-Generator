let items = [];
let filesData = [];
let advancedMode = false;
let itemGroups = {}; // To track item groups for collapsing

// Initialize
document.addEventListener('DOMContentLoaded', () => {
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
    
  // Set up event listeners
  document.getElementById("addItem").addEventListener("click", addItemToList);
  document.getElementById("downloadJson").addEventListener("click", downloadJson);
  document.getElementById("advancedMode").addEventListener("click", toggleAdvancedMode);
  document.getElementById("searchInput").addEventListener("input", handleSearch);
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleAdvancedMode() {
  advancedMode = !advancedMode;
  const advancedModeBtn = document.getElementById("advancedMode");
  
  if (advancedMode) {
    advancedModeBtn.textContent = "Advanced Mode";
    advancedModeBtn.classList.add("advanced");
  } else {
    advancedModeBtn.textContent = "Basic Mode";
    advancedModeBtn.classList.remove("advanced");
  }
  
  // Update item display to show/hide IDs
  document.querySelectorAll('.item-id').forEach(el => {
    if (advancedMode) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
  
  updateItemDisplay();
}

function handleSearch() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const suggestionsContainer = document.getElementById("searchSuggestions");
  
  // Filter the list items
  searchItems(searchText);
  
  // Show/hide and populate suggestions
  if (searchText.length > 0) {
    // Find matching items in filesData for suggestions
    const matchingItems = filesData
      .filter(item => 
        item.name.toLowerCase().includes(searchText) || 
        item.id.toLowerCase().includes(searchText))
      .slice(0, 5); // Limit to top 5 results
      
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions
    
    if (matchingItems.length > 0) {
      suggestionsContainer.classList.add('active');
      
      matchingItems.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.innerHTML = `
          <div class="item-name">${item.name}</div>
          <div class="item-id">${item.id}</div>
        `;
        
        // Add click event to select this item in the dropdown
        suggestionItem.addEventListener('click', () => {
          document.getElementById('itemSelect').value = item.id;
          suggestionsContainer.classList.remove('active');
          document.getElementById('searchInput').value = '';
        });
        
        suggestionsContainer.appendChild(suggestionItem);
      });
    } else {
      suggestionsContainer.classList.remove('active');
    }
  } else {
    suggestionsContainer.classList.remove('active');
  }
}

function addItemToList() {
  const itemID = document.getElementById("itemSelect").value;
  const count = parseInt(document.getElementById("count").value, 10) || 1;

  const randomHue = document.getElementById("randomHue").checked;
  const randomSaturation = document.getElementById("randomSaturation").checked;
  const randomSize = document.getElementById("randomSize").checked;

  // Get item name
  const itemName = filesData.find(f => f.id === itemID)?.name || itemID;
  
  // Get values
  const hueVal = parseInt(document.getElementById("hue").value) || 0;
  const satVal = parseInt(document.getElementById("saturation").value) || 0;
  const sizeVal = parseInt(document.getElementById("size").value) || 0;

  // Create a unique group key for this item
  // Key is based on the item ID and the values (either fixed or a flag for random)
  // Using the actual values for fixed and a marker for random ensures similar items stack
  const groupKey = `${itemID}-h${randomHue ? 'R' : hueVal}-s${randomSaturation ? 'R' : satVal}-sz${randomSize ? 'R' : sizeVal}`;

  // For randomized items, we'll generate a representative item with the average values
  // This is just for display purposes, the actual items will have their random values
  let representativeItem = {
    itemID,
    colorHue: hueVal,
    colorSaturation: satVal,
    scaleModifier: sizeVal,
    groupKey,
    isRandom: randomHue || randomSaturation || randomSize
  };

  // Create and add all the items with their real values
  for (let i = 0; i < count; i++) {
    const hue = randomHue ? getRandomInt(0, 255) : hueVal;
    const saturation = randomSaturation ? getRandomInt(0, 100) : satVal;
    const size = randomSize ? getRandomInt(-100, 100) : sizeVal;

    const newItem = {
      itemID,
      colorHue: hue,
      colorSaturation: saturation,
      scaleModifier: size,
      groupKey // All items with the same configuration share a groupKey
    };

    items.push(newItem);
  }
  
  // Update or create the group entry
  if (!itemGroups[groupKey]) {
    itemGroups[groupKey] = {
      count: 0,
      item: representativeItem
    };
  }
  itemGroups[groupKey].count += count;
  
  // Update the display
  updateItemDisplay();
}

function updateItemDisplay() {
  // Clear the current display
  const itemList = document.getElementById("itemList");
  itemList.innerHTML = '';
  
  // Add all grouped items
  for (const groupKey in itemGroups) {
    if (itemGroups[groupKey].count > 0) {
      const groupData = itemGroups[groupKey];
      const item = groupData.item;
      const itemName = filesData.find(f => f.id === item.itemID)?.name || item.itemID;
      addItemElement(item, itemName, groupData.count);
    }
  }
  
  // Apply current search filter
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  if (searchText.length > 0) {
    searchItems(searchText);
  }
}

function addItemElement(item, itemName, count) {
  const itemList = document.getElementById("itemList");
  const li = document.createElement("li");
  
  if (count > 1) {
    li.classList.add('group-item');
  }
  
  // Create item content container
  const contentDiv = document.createElement("div");
  contentDiv.className = "item-content";
  
  // Item name and properties
  const itemText = document.createElement("div");
  
  // Display different text based on whether the item has random properties
  if (item.isRandom) {
    itemText.textContent = `${itemName} (Random Properties)`;
  } else {
    itemText.textContent = `${itemName} (Hue: ${item.colorHue}, Sat: ${item.colorSaturation}, Size: ${item.scaleModifier})`;
  }
  
  // Add count if more than 1
  if (count > 1) {
    const countSpan = document.createElement("span");
    countSpan.className = "item-count";
    countSpan.textContent = `Count: ${count}`;
    itemText.appendChild(countSpan);
  }
  
  contentDiv.appendChild(itemText);
  
  // Item ID (shown in advanced mode)
  const itemIdDiv = document.createElement("div");
  itemIdDiv.className = "item-id" + (advancedMode ? " visible" : "");
  itemIdDiv.textContent = `(${item.itemID})`;
  contentDiv.appendChild(itemIdDiv);
  
  li.appendChild(contentDiv);
  
  // Create action buttons
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "item-actions";
  
  // Add delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    deleteItem(item, 1);
  });
  actionsDiv.appendChild(deleteBtn);
  
  // Add delete all button if count > 1
  if (count > 1) {
    const deleteAllBtn = document.createElement("button");
    deleteAllBtn.className = "delete-all";
    deleteAllBtn.textContent = "Delete All";
    deleteAllBtn.addEventListener("click", () => {
      deleteItem(item, count);
    });
    actionsDiv.appendChild(deleteAllBtn);
  }
  
  li.appendChild(actionsDiv);
  
  // Add data attributes for searching
  li.dataset.itemId = item.itemID.toLowerCase();
  li.dataset.itemName = itemName.toLowerCase();
  li.dataset.groupKey = item.groupKey;
  
  itemList.appendChild(li);
}

function deleteItem(item, count) {
  if (item.groupKey && itemGroups[item.groupKey]) {
    // Grouped item
    if (count >= itemGroups[item.groupKey].count) {
      // Remove all items in this group
      items = items.filter(i => i.groupKey !== item.groupKey);
      delete itemGroups[item.groupKey];
    } else {
      // Remove only some items
      itemGroups[item.groupKey].count -= count;
      
      // Remove actual items from items array (from the back)
      let removed = 0;
      for (let i = items.length - 1; i >= 0 && removed < count; i--) {
        if (items[i].groupKey === item.groupKey) {
          items.splice(i, 1);
          removed++;
        }
      }
    }
  } else {
    // Individual item (no group or group not found)
    items = items.filter(i => i !== item);
  }
  
  updateItemDisplay();
}

function searchItems(searchText) {
  if (!searchText) searchText = '';
  
  const itemElements = document.getElementById("itemList").children;
  
  for (let i = 0; i < itemElements.length; i++) {
    const element = itemElements[i];
    const itemId = element.dataset.itemId;
    const itemName = element.dataset.itemName;
    
    if (itemId.includes(searchText) || itemName.includes(searchText)) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  }
}

function downloadJson() {
  const baseItem = {
    itemID: "item_backpack_large_base",
    children: items.map(item => ({
      itemID: item.itemID,
      colorHue: item.colorHue,
      colorSaturation: item.colorSaturation,
      scaleModifier: item.scaleModifier
    }))
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
}
