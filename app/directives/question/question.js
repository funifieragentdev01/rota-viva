/**
 * rvQuestion — Diretiva de renderização de questão do quiz
 *
 * Encapsula o rendering de todos os tipos de questão suportados pelo Rota Viva.
 * Usa scope herdado (scope: true) do controller pai (QuizCtrl), portanto todos
 * os métodos e variáveis do quiz ($scope.current(), tfAnswer, form, etc.) estão
 * disponíveis no template sem re-declaração.
 *
 * Estrutura de dados correta (após migração do banco):
 *   choice.answer → letra da opção (A, B, C, D)
 *   choice.label  → texto da opção ("Polinizar plantas...")
 *
 * Uso:
 *   <question></question>
 *
 * Requer que o controller pai (QuizCtrl) forneça no $scope:
 *   current(), tfAnswer, form, diyPhotoData, locationData, locationError,
 *   locationLoading, speakTranscript, speakStatus, speakError, isSpeaking,
 *   provasDeCampo, provasDeCampoCount, provasDeCampoLoading, provasDeCampoLoaded,
 *   charImg, selectOption(), selectTF(), diyTakePhoto(), getLocation(),
 *   needsLocation(), ddAddToSlot(), ddRemoveFromSlot(), listenOrderAdd(),
 *   listenOrderRemove(), startSpeakRecord(), stopSpeakRecord(), retrySpeakRecord(),
 *   speakTTS(), canConfirm(), checkAnswer(), next(), currentIndex, questions
 */
angular.module('rotaViva')

.directive('question', function() {
    return {
        restrict:    'E',
        scope:       true,   // herda do QuizCtrl sem isolar
        templateUrl: 'directives/question/question.html',
        replace:     true
    };
});
