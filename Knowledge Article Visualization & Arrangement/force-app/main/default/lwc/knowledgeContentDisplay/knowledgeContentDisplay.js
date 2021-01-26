import { LightningElement, api, wire } from 'lwc';
import getKnowledgeArticle from '@salesforce/apex/DE_KnowledgeVisualizationHelper.getKnowledgeArticle';
import voteArticle from '@salesforce/apex/DE_KnowledgeVisualizationHelper.voteArticle';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFeedback from '@salesforce/apex/DE_KnowledgeVisualizationHelper.getFeedback';

export default class KnowledgeContentDisplay extends LightningElement {
    selectedKnowledgeArticleId;
    articleDetail;
    articleTitle;
    articleNumber;
    recordType;
    language;
    versionNumber;
    likes = 0;
    dislikes = 0;
    @api
    get knowledgeArticleId() {
        return this.selectedKnowledgeArticleId;
    }
    set knowledgeArticleId(value) {
        this.selectedKnowledgeArticleId = value;
    }

    @wire(getKnowledgeArticle, { knowledgeArticleId: '$selectedKnowledgeArticleId' })
    getKnowledgeArticleDetails({ error, data }) {
        if (error)
            console.log(data);
        else if (data) {
            this.articleDetail = data.FAQ_Answer__c;
            this.articleTitle = data.Title;
            this.articleNumber = data.ArticleNumber;
            this.recordType = data.RecordType.Name;
            this.language = data.Language;
            this.versionNumber = data.VersionNumber
        }
    }

    @wire(getFeedback, { knowledgeArticleId: '$selectedKnowledgeArticleId' })
    getKnowledgeFeedback({ error, data }) {
        if (error)
            console.log(error);
        else if (data) {
            JSON.parse(JSON.stringify(data)).map(item => {
                if (item.artfeed__Like__c)
                    this.likes = this.likes + 1;
                else
                    this.dislikes = this.dislikes + 1;
            })
        }
    }

    handleVote(event) {
        let type = event.target.dataset.type;
        let boolType;

        if(type === 'up'){
            boolType = true;
            this.likes = this.likes + 1;
        }
        else{
            boolType = false;
            this.dislikes = this.dislikes + 1;
        }
        voteArticle({
            knowledgeArticleId: this.selectedKnowledgeArticleId,
            vote: boolType
        })
            .then(response => {
                const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Feedback submited!!',
                    variant: 'success',
                });
                this.dispatchEvent(evt);
            })
    }
}