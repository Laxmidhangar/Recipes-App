import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRecipe, setEditRecipe] = useState(null);

  const [newRecipe, setNewRecipe] = useState({
    name: "",
    image: "",
    category: "Indian",
    ingredients: "",
    instructions: "",
    cookingTime: "",
    difficulty: "Easy",
  });


  useEffect(() => {
    fetch("http://localhost:5000/api/recipes")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setRecipes(data);
        setLoading(false);
      })
      .catch((error) => {
  console.log("Error fetching recipes:", error);
  setError("Failed to load recipes");
  setLoading(false);
});
  }, []);

  const addRecipe = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newRecipe,
          ingredients: newRecipe.ingredients
            .split(",")
            .map((item) => item.trim()),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add recipe");
      }

      setRecipes([...recipes, data]);

      setNewRecipe({
        name: "",
        image: "",
        category: "Indian",
        ingredients: "",
        instructions: "",
        cookingTime: "",
        difficulty: "Easy",
      });

      setShowForm(false);

      console.log("Recipe added:", data);
    } catch (error) {
      console.log("Error adding recipe:", error);
    }
  };


  const deleteRecipe = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }

      setRecipes(
        recipes.filter((recipe) => recipe._id !== id)
      );

      if (selectedRecipe?._id === id) {
        setSelectedRecipe(null);
      }

      console.log("Recipe deleted successfully");
    } catch (error) {
      console.log("Error deleting recipe:", error);
    }
  };
  const updateRecipe = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/${editRecipe._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editRecipe),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update recipe");
      }

      setRecipes(
        recipes.map((recipe) =>
          recipe._id === data._id ? data : recipe
        )
      );

      setEditRecipe(null);

      console.log("Recipe updated successfully");
    } catch (error) {
      console.log("Error updating recipe:", error);
    }
  };

  if (loading) {
    return <h2>Loading recipes...</h2>;
  }
  if (error) {
  return <h2 className="error-message">{error}</h2>;
}

  return (
    <div className="app">
      <h1>🍴 My Recipe Collection</h1>
      <input
        type="text"
        placeholder="Search recipe..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="category-select"
      >
        <option value="All">All Categories</option>
        <option value="Indian">Indian</option>
        <option value="Dessert">Dessert</option>
      </select>
      <button

        className="add-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Close Form" : "Add Recipe"}
      </button>

      {showForm && (
        <form className="recipe-form" onSubmit={addRecipe}>
          <input
            type="text"
            placeholder="Recipe name"
            value={newRecipe.name}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                name: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Image URL"
            value={newRecipe.image}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                image: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Category"
            value={newRecipe.category}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                category: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Ingredients (comma separated)"
            value={newRecipe.ingredients}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                ingredients: e.target.value,
              })
            }
          />

          <input
            type="text"
            placeholder="Cooking time"
            value={newRecipe.cookingTime}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                cookingTime: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Instructions"
            value={newRecipe.instructions}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                instructions: e.target.value,
              })
            }
          />

          <select
            value={newRecipe.difficulty}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                difficulty: e.target.value,
              })
            }
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button type="submit">
            Save Recipe
          </button>
        </form>
      )}

      <div className="recipe-container">
        {

          recipes
            .filter((recipe) =>
              recipe.name.toLowerCase().includes(search.toLowerCase())
            )
            .filter((recipe) =>
              category === "All" ? true : recipe.category === category
            )

            .map((recipe) => (
              <div className="recipe-card" key={recipe._id}>
                <img src={recipe.image} alt={recipe.name} />

                <div className="recipe-info">
                  <h2>{recipe.name}</h2>

                  <p>
                    <strong>Category:</strong> {recipe.category}
                  </p>

                  <p>
                    <strong>Cooking Time:</strong> {recipe.cookingTime}
                  </p>

                  <p>
                    <strong>Difficulty:</strong> {recipe.difficulty}
                  </p>

                  <button onClick={() => setSelectedRecipe(recipe)}>
                    View Details
                  </button>
                  <button
                    className="edit-button"
                    onClick={() => setEditRecipe(recipe)}
                  >
                    Update
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deleteRecipe(recipe._id)}
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))


        }
{recipes
    .filter((recipe) =>
      recipe.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((recipe) =>
      category === "All" ? true : recipe.category === category
    ).length === 0 && (
      <p className="no-recipes">
        😔 No recipes found
      </p>
    )}

        {selectedRecipe && (
          <div className="recipe-details">
            <h2>{selectedRecipe.name}</h2>

            <h3>Ingredients</h3>

            <ul>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}

            
            </ul>

            <h3>Instructions</h3>

            <p>{selectedRecipe.instructions}</p>

            <button onClick={() => setSelectedRecipe(null)}>
              Close
            </button>
          </div>
        )}
        {editRecipe && (
          <form className="edit-form" onSubmit={updateRecipe}>
            <h2>Edit Recipe</h2>

            <input
              type="text"
              value={editRecipe.name}
              onChange={(e) =>
                setEditRecipe({
                  ...editRecipe,
                  name: e.target.value,
                })
              }
            />

            <input
              type="text"
              value={editRecipe.image}
              onChange={(e) =>
                setEditRecipe({
                  ...editRecipe,
                  image: e.target.value,
                })
              }
            />

            <input
              type="text"
              value={editRecipe.category}
              onChange={(e) =>
                setEditRecipe({
                  ...editRecipe,
                  category: e.target.value,
                })
              }
            />

            <input
              type="text"
              value={editRecipe.ingredients.join(", ")}
              onChange={(e) =>
                setEditRecipe({
                  ...editRecipe,
                  ingredients: e.target.value.split(",").map((item) => item.trim()),
                })
              }
            />

            <input
              type="text"
              value={editRecipe.cookingTime}
              onChange={(e) =>
                setEditRecipe({
                  ...editRecipe,
                  cookingTime: e.target.value,
                })
              }
            />

            <textarea
              value={editRecipe.instructions}
              onChange={(e) =>
                setEditRecipe({
                  ...editRecipe,
                  instructions: e.target.value,
                })
              }
            />

            <select
              value={editRecipe.difficulty}
              onChange={(e) =>
                setEditRecipe({
                  ...editRecipe,
                  difficulty: e.target.value,
                })
              }
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <button type="submit">
              Update Recipe
            </button>

            <button
              type="button"
              onClick={() => setEditRecipe(null)}
            >
              Cancel
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default App;