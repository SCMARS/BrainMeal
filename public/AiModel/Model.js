import * as tf from '@tensorflow/tfjs';

const trainData = [
    { features: [60, 170, 30, 2500, 'gain'], label: 'gain' },
    { features: [70, 180, 25, 2200, 'lose'], label: 'lose' },
    { features: [80, 190, 35, 2300, 'gain'], label: 'gain' },
    { features: [65, 165, 28, 2000, 'lose'], label: 'lose' },
    // Добавь больше примеров данных с параметрами
];

// Функция для преобразования данных
function preprocessData(data) {
    return {
        inputs: data.map(item => item.features.slice(0, 4)), // Вес, рост, возраст, калории
        outputs: data.map(item => item.label === 'gain' ? [1, 0] : [0, 1]),
    };
}

// Подготовка данных
const { inputs, outputs } = preprocessData(trainData);

// Создание модели
const model = tf.sequential();

// Слой с входными данными (4 входных параметра)
model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [4] }));

// Выходной слой с двумя категориями: 'gain' и 'lose'
model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));

// Компиляция модели
model.compile({
    optimizer: tf.train.adam(),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
});

// Обучение модели
async function trainModel() {
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);

    await model.fit(xs, ys, {
        epochs: 100,
        callbacks: tf.callbacks.earlyStopping({ monitor: 'loss', patience: 10 }),
    });
    console.log('Model trained');
}

// Предсказание на основе новых данных
async function predict(userData) {
    const prediction = model.predict(tf.tensor2d([userData]));
    const result = prediction.arraySync();

    return result[0][0] > result[0][1] ? 'gain' : 'lose';
}

// Обучение модели и предсказание
async function run() {
    await trainModel();

    // Пример: предсказание для нового пользователя
    const userData = [75, 175, 30, 2400]; // Пример пользователя: вес, рост, возраст, калории
    const plan = await predict(userData);
    console.log(`User should focus on: ${plan}`);
}

run();
