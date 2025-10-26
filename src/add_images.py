import json
import re
with open("MealMaster.json", "r", encoding="utf-8") as f:
    data = json.load(f)
def to_filename(name):
    return re.sub(r'\s+', '-', name.strip().lower()) + ".jpg"
for category, recipes in data.items():
    for recipe in recipes:
        english_name = recipe.get("recipe name", {}).get("english", "").strip()
        if english_name:
            recipe["image"] = f"/images/{to_filename(english_name)}"
        else:
            recipe["image"] = ""
with open("MealMaster_with_images.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ MealMaster_with_images.json created with image links.")
