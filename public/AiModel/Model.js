const tf = require('@tensorflow/tfjs');

// Создание продвинутой модели нейронной сети
const model = tf.sequential();

// Входной слой
model.add(tf.layers.dense({
    units: 128,
    activation: 'relu',
    inputShape: [5]  // Входной слой с 5 входами (вес, рост, пол, возраст, программа питания)
}));

// Скрытые слои
model.add(tf.layers.dense({units: 256, activation: 'relu'}));
model.add(tf.layers.dropout({rate: 0.5}));
model.add(tf.layers.dense({units: 128, activation: 'relu'}));
model.add(tf.layers.dense({units: 64, activation: 'relu'}));

// Выходной слой
model.add(tf.layers.dense({units: 1, activation: 'linear'}));  // Выходной слой для предсказания

model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError'
});

// Вывод структуры модели
model.summary();

// Функция предварительной обработки данных клиента
function preprocessData(weight, height, gender, age, mealPlan) {
    gender = gender === 'male' ? 1 : 0;
    return [weight, height, gender, age, mealPlan];
}

// Пример использования функции предварительной обработки данных
const clientData = preprocessData(70, 180, 'male', 25, 2);
const tensorData = tf.tensor2d([clientData]);

// Прогнозирование рациона питания
model.predict(tensorData).print();

// Пример данных для обучения
const trainX = tf.tensor2d([
    [70, 180, 1, 25, 2],
    [65, 165, 0, 30, 3],
    [80, 175, 1, 20, 1]
]);

const trainY = tf.tensor2d([
    [2500],
    [2200],
    [2800]
]);

// Обучение модели
async function trainModel() {
    await model.fit(trainX, trainY, {
        epochs: 100,
        callbacks: {
            onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch}: loss = ${logs.loss}`)
        }
    });
    console.log('Модель обучена');
}

trainModel();
