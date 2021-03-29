import { LightningElement, wire, track, api } from 'lwc';
import getKnowledgeCategories from '@salesforce/apex/DE_KnowledgeVisualizationHelper.getKnowledgeCategories';


export default class KnowledgeArticleDisplay extends LightningElement {
    selectedKnowledgeArticleId;
    @api recordId;

    connectedCallback(){
        if(this.recordId != undefined || this.recordId != null)
            this.selectedKnowledgeArticleId = this.recordId;
    }

    handleArticleSelected(event){
        this.selectedKnowledgeArticleId = event.detail;
        console.log(this.selectedKnowledgeArticleId);
    }
}