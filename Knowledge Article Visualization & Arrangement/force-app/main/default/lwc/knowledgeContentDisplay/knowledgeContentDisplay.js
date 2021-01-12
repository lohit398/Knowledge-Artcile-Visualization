import { LightningElement,api,wire } from 'lwc';
import getKnowledgeArticle from '@salesforce/apex/DE_KnowledgeVisualizationHelper.getKnowledgeArticle';

export default class KnowledgeContentDisplay extends LightningElement {
    selectedKnowledgeArticleId;
    articleDetail;
    articleTitle;
    articleNumber;
    recordType;
    language;
    versionNumber;
    @api
    get knowledgeArticleId(){
        return this.selectedKnowledgeArticleId;
    }
    set knowledgeArticleId(value){
        this.selectedKnowledgeArticleId = value;
    }

    @wire(getKnowledgeArticle, {knowledgeArticleId: '$selectedKnowledgeArticleId'})
    getKnowledgeArticleDetails({error,data}){
        if(error)
            console.log(data);
        else if(data){
            this.articleDetail = data.FAQ_Answer__c;
            this.articleTitle = data.Title;
            this.articleNumber = data.ArticleNumber;
            this.recordType = data.RecordType.Name;
            this.language = data.Language;
            this.versionNumber = data.VersionNumber
        }
    }
}