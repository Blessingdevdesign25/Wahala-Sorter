# How My Wahala Sorter Works (By Me, Age 7)

Hi! I made a cool app called Wahala Sorter. "Wahala" means trouble or chores! I'm going to tell you how every single line of my code works, like I'm building a big Lego castle!

## The Types (`src/types/index.ts`)

This is like the instruction manual for my Lego pieces. It tells the computer exactly what my pieces look like so it doesn't get confused.

- `export type ColumnType = 'Now' | 'Soon' | 'Later';`
  This means a task can only live in three magic boxes. The "Now" box, the "Soon" box, or the "Later" box. No other boxes allowed!
- `export interface Task { ... }`
  This tells the computer what a single task looks like.
  - `id: string;` It needs a super secret name (id) so we don't mix it up with other tasks.
  - `title: string;` It needs a regular name, like "Clean my room".
  - `column: ColumnType;` It needs to know which magic box it belongs in!
  - `createdAt: number;` It needs to remember exactly when it was born.
- `export const COLUMNS: ColumnType[] = ['Now', 'Soon', 'Later'];`
  This is just a list of my three magic boxes so I can read them out loud later without forgetting.

## The Time Helper (`src/utils/time.ts`)

Numbers look scary, so this file makes them look pretty!

- `export function formatTimestamp(timestamp: number): string {`
  This is a magic machine. You put a big ugly number in it, and it spits out words!
- `const date = new Date(timestamp);`
  The computer turns the ugly number into a real clock time.
- `return date.toLocaleTimeString(...)`
  This makes the clock time look super nice, like "10:45 AM", instead of a weird robot time.

## The Magic Brain (`src/hooks/useTasks.ts`)

This is the brain of my app! It remembers all the chores.

- `export function useTasks(initialTasks: Task[] = []) {`
  This is my brain machine. You can give it some chores to start with, or nothing at all!
- `const [tasks, setTasks] = useState<Task[]>(initialTasks);`
  `tasks` is my bucket of chores. `setTasks` is my magic wand to add or throw away chores!
- `const addTask = (title: string, column: ColumnType = 'Now') => {`
  This is a button on my brain machine. You press it to make a new chore! It goes in the "Now" box if you don't say where.
- `if (!title.trim()) return;`
  If you try to give me an invisible chore with no words, I just say "No way!" and ignore you.
- `const newTask: Task = { ... }`
  This creates the new chore!
  - `id: crypto.randomUUID(),` Gives it a crazy long secret name.
  - `title: title.trim(),` Takes your words and cuts off the extra spaces.
  - `column,` Puts it in the box you said.
  - `createdAt: Date.now(),` Writes down the exact second it was born!
- `setTasks((prev) => [...prev, newTask]);`
  My magic wand takes the old chores, puts them in a line, and sticks the new chore at the very end!
- `const deleteTask = (id: string) => {`
  This is the trash can button! You give it a secret name.
- `setTasks((prev) => prev.filter((task) => task.id !== id));`
  The magic wand looks at all the chores. If a chore has the secret name you gave me, it throws it away! All the other chores get to stay.
- `return { tasks, setTasks, addTask, deleteTask };`
  My brain machine hands you all the buttons and the bucket so you can play with them!

## The Header (`src/components/Header.tsx`)

This is the giant sign on top of my castle!

- `export function Header() {`
  This makes the giant sign.
- `return ( <header> ... </header> );`
  This draws the sign on the screen.
- `<h1>Wahala Sorter</h1>`
  This writes the name of my app in big, bold, giant letters!
- `<p>A drag-and-drop priority board...</p>`
  This is the tiny text underneath that tells people what my app does.

## The Add Form (`src/components/AddTaskForm.tsx`)

This is the little letterbox where you type your new chores!

- `interface AddTaskFormProps { onAdd: (title: string) => void; }`
  This tells the letterbox it needs a magic pipe (`onAdd`) to send the letters to my brain machine.
- `export function AddTaskForm({ onAdd }: AddTaskFormProps) {`
  This builds the letterbox and hooks up the magic pipe!
- `const [title, setTitle] = useState('');`
  This is a piece of paper (`title`) and a pencil (`setTitle`). Right now, the paper is blank.
- `const handleSubmit = (e: React.FormEvent) => {`
  This is what happens when you smash the "Add Task" button!
- `e.preventDefault();`
  This stops the web page from refreshing and ruining everything! Bad web page!
- `if (title.trim()) { onAdd(title); setTitle(''); }`
  If the paper actually has words on it, it shoots the words down the `onAdd` pipe, and then erases the paper clean for next time!
- `return ( <form onSubmit={handleSubmit}> ... </form> )`
  This draws the letterbox and the button on the screen!
- `<input value={title} onChange={(e) => setTitle(e.target.value)} />`
  This is where you type! Every time you press a key on your keyboard, the pencil (`setTitle`) quickly writes it on my piece of paper (`title`).
- `<button disabled={!title.trim()}>`
  If the paper is blank, this makes the button sleepy and you can't click it!

## The Task Card (`src/components/TaskCard.tsx`)

This is a single little card that holds a chore! You can grab it and throw it around!

- `export function TaskCard({ task, onDelete }: TaskCardProps) {`
  This builds the card. It needs to know which `task` it is, and it needs the trash can button (`onDelete`).
- `const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ ... })`
  This is a super-secret spell from `dnd-kit`! It gives the card the power to fly when I click and drag it!
- `const style = { transform: CSS.Transform.toString(transform), transition }`
  This tells the card exactly how to fly across the screen smoothly.
- `<div ref={setNodeRef} style={style} {...attributes} {...listeners}>`
  This wraps the whole card in the flying spell so the computer knows I can grab it!
- `className={\`task-card ${isDragging ? 'is-dragging' : ''}\`}`
  If the card is currently flying in the air (`isDragging`), I make it see-through so it looks super cool!
- `<span className="task-title">{task.title}</span>`
  This writes the chore's name on the card!
- `<button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>`
  This is the trash icon! When I click it, `e.stopPropagation()` stops the card from thinking I'm trying to drag it. Then it pushes the trash can button with its secret name!
- `<span className="task-time">{formatTimestamp(task.createdAt)}</span>`
  This uses the time machine to write down when the card was born at the bottom of the card.

## The Column (`src/components/Column.tsx`)

This is one of the three magic boxes! It holds a bunch of cards!

- `export function Column({ column, tasks, onDeleteTask }: ColumnProps) {`
  This builds the box. It needs to know its name (`column`), what cards are inside (`tasks`), and the trash can button.
- `const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);`
  This is a smart trick! It makes a list of all the secret names of the cards inside it, so the flying spell knows who is who.
- `const { setNodeRef } = useDroppable({ id: column })`
  This is another spell! It tells the computer "Hey, this box is a landing pad! Flying cards can land here!"
- `<span>{column}</span> <span className="column-count">{tasks.length}</span>`
  This writes the name of the box (like "Now") and counts how many cards are inside it (like "3")!
- `<div className="column-body" ref={setNodeRef}>`
  This applies the landing pad spell to the inside of the box!
- `<SortableContext items={taskIds}>`
  This tells all the cards inside the box to behave nicely and make room if another card lands on them!
- `{tasks.map((task) => ( <TaskCard key={task.id} task={task} onDelete={onDeleteTask} /> ))}`
  This looks at my bucket of cards for this box, and draws a beautiful `TaskCard` for every single one!

## The Main App (`src/App.tsx`)

This is the big boss file! It puts all the Lego pieces together to build the whole castle!

- `export default function App() {`
  This is the boss!
- `const { tasks, setTasks, addTask, deleteTask } = useTasks([...]);`
  The boss turns on the brain machine and gives it three fake chores to start with so the screen isn't empty!
- `const [activeTask, setActiveTask] = useState<Task | null>(null);`
  The boss has a special hand (`activeTask`). When I grab a card, the boss holds onto it so it knows which one is flying.
- `const sensors = useSensors(...)`
  These are the boss's eyes! They watch my mouse and my keyboard to see if I'm trying to grab a card.
- `const handleDragStart = (event) => { ... setActiveTask(task); }`
  When my mouse grabs a card, the boss grabs it in its special hand!
- `const handleDragOver = (event) => { ... }`
  This is the craziest part! While the card is flying in the air, the boss is watching.
  - If the flying card goes over *another* card, the boss quickly pushes the other card out of the way and swaps them around using `arrayMove`!
  - If the flying card goes over an *empty box*, the boss quickly changes the card's magic box name so it belongs to the new box!
- `const handleDragEnd = () => { setActiveTask(null); }`
  When I let go of the mouse, the card lands. The boss lets go of the card and dusts off its hands.
- `return ( <> <Header /> <AddTaskForm /> ...`
  The boss places the giant sign and the letterbox at the top of the screen!
- `<DndContext ...>`
  The boss casts a giant invisible net over the whole screen so the flying spell works everywhere!
- `<div className="board"> {COLUMNS.map((col) => <Column /> )} </div>`
  The boss builds the three magic boxes ("Now", "Soon", "Later") side by side!
- `<DragOverlay> {activeTask ? <TaskCard ... /> : null} </DragOverlay>`
  This is a ghost card! When you drag a card, the original card goes invisible, and the boss makes a ghost copy follow your mouse pointer perfectly so it looks like you are holding it!

## The Root (`src/main.tsx`)

This is the super boring file that starts everything.

- `createRoot(document.getElementById('root')!).render(...)`
  This tells the computer "Hey, see that empty space on the screen? Shove the entire boss castle in there right now!"

And that's my whole app! I'm seven and I'm very smart!
