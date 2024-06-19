import sys
import time
import json
from afinn import Afinn

def determine_final_label(classifier_label, sentiment_label):
    classifier_weight = 3 if classifier_label != 'neutral' else 1
    sentiment_weight = 1 if sentiment_label != 'neutral' else 0

    if classifier_weight > sentiment_weight:
        return classifier_label
    elif classifier_weight < sentiment_weight:
        return sentiment_label
    else:
        return classifier_label if classifier_label != 'neutral' else 'neutral'

def analyze_feedback(feedback_data):
    afinn = Afinn()
    results = []

    for feedback in feedback_data:
        total_score = feedback['teaching'] + feedback['coursecontent'] + feedback['examination'] + feedback['labwork']
        if total_score > 2:
            classifier_label = 'positive'
        elif 0 < total_score <= 2:
            classifier_label = 'neutral'
        else:
            classifier_label = 'negative'

        comment_sentiment_score = afinn.score(feedback['comments'])
        sentiment_label = 'positive' if comment_sentiment_score > 0 else ('negative' if comment_sentiment_score < 0 else 'neutral')

        final_label = determine_final_label(classifier_label, sentiment_label)
        results.append({'faculty_id': feedback['faculty_id'], 'output_label': final_label})

    return results

if __name__ == "__main__":
    try:
        feedback_data = json.loads(sys.argv[1])
        analysis_results = analyze_feedback(feedback_data)
        print(json.dumps(analysis_results)) 
        sys.stdout.flush()  
    except Exception as e:
        print("Error during analysis:", str(e))
        sys.stdout.flush()