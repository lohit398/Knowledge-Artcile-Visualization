import { LightningElement, api, wire } from 'lwc';
import getKnowledgeArticle from '@salesforce/apex/DE_KnowledgeVisualizationHelper.getKnowledgeArticle';
import voteArticle from '@salesforce/apex/DE_KnowledgeVisualizationHelper.voteArticle';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class KnowledgeContentDisplay extends LightningElement {
    selectedKnowledgeArticleId;
    articleDetail;
    articleTitle;
    articleNumber;
    recordType;
    language;
    versionNumber;
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

    handleVote(event) {
        let type = event.target.dataset.type;
        voteArticle({
            knowledgeArticleId: this.selectedKnowledgeArticleId,
            type: type
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