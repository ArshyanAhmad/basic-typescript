"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const db_1 = require("../db");
const zod_1 = require("zod");
const router = express_1.default.Router();
const todoSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string()
});
router.post('/todos', middleware_1.authenticateJwt, (req, res) => {
    var _a;
    const success = todoSchema.safeParse(req.body);
    if (!success.success) {
        const errorMessage = ((_a = success === null || success === void 0 ? void 0 : success.error) === null || _a === void 0 ? void 0 : _a.errors.map(err => err.message).join(", ")) || "Something went wrong";
        res.status(500).json({ error: errorMessage });
    }
    const { title, description } = req.body;
    const done = false;
    const userId = req.headers["userId"];
    const newTodo = new db_1.Todo({ title, description, done, userId });
    newTodo.save()
        .then((savedTodo) => {
        res.status(201).json(savedTodo);
    })
        .catch((err) => {
        res.status(500).json({ error: 'Failed to create a new todo' });
    });
});
router.get('/todos', middleware_1.authenticateJwt, (req, res) => {
    const userId = req.headers["userId"];
    db_1.Todo.find({ userId })
        .then((todos) => {
        res.json(todos);
    })
        .catch((err) => {
        res.status(500).json({ error: 'Failed to retrieve todos' });
    });
});
router.patch('/todos/:todoId/done', middleware_1.authenticateJwt, (req, res) => {
    const { todoId } = req.params;
    const userId = req.headers["userId"];
    db_1.Todo.findOneAndUpdate({ _id: todoId, userId }, { done: true }, { new: true })
        .then((updatedTodo) => {
        if (!updatedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(updatedTodo);
    })
        .catch((err) => {
        res.status(500).json({ error: 'Failed to update todo' });
    });
});
exports.default = router;
