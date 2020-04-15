const userRoutes = require("./users");
const momentRoutes = require("./moments");
const commentRoutes = require("./comments");

const constructorMethod = app => {
    app.use("/users", userRoutes);
    app.use("/moments", momentRoutes);
    app.use("/comments", commentRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

module.exports = constructorMethod;